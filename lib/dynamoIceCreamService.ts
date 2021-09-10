import IceCream from "./iceCream";
import { v4 as uuidv4 } from "uuid";
import Ingredient from "./ingredient";
import Order from "./order";
import {
  BatchWriteCommandInput,
  DynamoDBDocument,
} from "@aws-sdk/lib-dynamodb";

export default class DynamoIceCreamService {
  private db: DynamoDBDocument;

  constructor(db: DynamoDBDocument) {
    this.db = db;
  }

  async getIceCreamById(id: string): Promise<IceCream | undefined> {
    try {
      console.log("Getting ice cream:$id from dyanomoDB", id);
      let item = await this.db.get({
        TableName: "IceCream",
        Key: {
          PK: `ICE-CREAM#${id}`,
          SK: "ICE-CREAM",
        },
      });
      console.log("Item %s is retrieved", item.Item);
      return Promise.resolve(
        item.Item ? this.toIceCream(item.Item) : undefined
      );
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async getIceCreamsByName(name: string): Promise<IceCream[]> {
    try {
      let queryOutput = await this.db.query({
        TableName: "IceCream",
        IndexName: "IceCream-Name-Index",
        KeyConditionExpression: "SK = :sk and begins_with(#n, :name)",
        ExpressionAttributeValues: {
          ":sk": "ICE-CREAM",
          ":name": name.toLowerCase(),
        },
        ExpressionAttributeNames: {
          "#n": "Name",
        },
      });
      return Promise.resolve(this.toIceCreams(queryOutput.Items));
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async getIceCreams(): Promise<IceCream[]> {
    try {
      let queryOutput = await this.db.query({
        TableName: "IceCream",
        IndexName: "IceCream-Name-Index",
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: {
          ":sk": "ICE-CREAM",
        },
      });
      return Promise.resolve(this.toIceCreams(queryOutput.Items));
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  private toIceCreams(items: undefined | any): IceCream[] {
    let iceCreams = items
      ? items.map((item: any) => this.toIceCream(item))
      : [];
    return iceCreams;
  }

  private toIceCream(item: any): IceCream {
    return new IceCream(
      <string>item.Id,
      <string>item.Name,
      <Ingredient[]>item.Ingredients
    );
  }

  async saveIceCream(iceCream: IceCream): Promise<string> {
    console.log("Creating %s in dynamoDB", iceCream);
    iceCream.id = uuidv4();
    try {
      await this.db.put({
        TableName: "IceCream",
        Item: {
          PK: `ICE-CREAM#${iceCream.id}`,
          SK: "ICE-CREAM",
          Id: iceCream.id,
          Name: iceCream.name.toLowerCase(),
          Ingredients: iceCream.ingredients,
        },
      });
      return Promise.resolve(iceCream.id);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async saveOrder(order: Order): Promise<String> {
    order.id = uuidv4();

    // prepare for batch write
    let requests = [];

    // customer-order request
    let customerOrderRequest = {
      PutRequest: {
        Item: {
          PK: `CUSTOMER#${order.customerId}`,
          SK: `ORDER#${order.id}`,
        },
      },
    };
    requests.push(customerOrderRequest);

    // order-ice-cream requests
    order.orderItems.forEach((orderItem) => {
      let orderItemRequest = {
        PutRequest: {
          Item: {
            PK: `ORDER#${order.id}`,
            SK: `ICE-CREAM#${orderItem.itemId}`,
            Quantity: orderItem.quantity,
            UnitPrice: orderItem.unitPrice,
          },
        },
      };
      requests.push(orderItemRequest);
    });

    let batchWriteInput: BatchWriteCommandInput = {
      RequestItems: {
        IceCream: requests,
      },
    };

    try {
      console.log("Batch Write Input:%s", JSON.stringify(batchWriteInput));
      let batchWriteOutput = await this.db.batchWrite(batchWriteInput);
      console.log("Batch Write Output:%s", JSON.stringify(batchWriteOutput));
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }

    return Promise.resolve(order.id);
  }
}
