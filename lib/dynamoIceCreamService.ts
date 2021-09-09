import IceCream from "./iceCream";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import {
  AttributeMap,
  ItemList,
  PutItemInput,
  PutItemInputAttributeMap,
  PutRequest,
} from "aws-sdk/clients/dynamodb";
import Ingredient from "./ingredient";
import Order from "./order";
import OrderItem from "./orderItem";

export default class DynamoIceCreamService {
  private db: AWS.DynamoDB.DocumentClient;

  constructor(db: AWS.DynamoDB.DocumentClient) {
    this.db = db;
  }

  async getIceCreamById(id: string): Promise<IceCream | undefined> {
    try {
      console.log("Getting ice cream:$id from dyanomoDB", id);
      let item = await this.db
        .get({
          TableName: "IceCream",
          Key: {
            PK: `ICE-CREAM#${id}`,
            SK: "ICE-CREAM",
          },
        })
        .promise();
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
      let queryOutput = await this.db
        .query({
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
        })
        .promise();

      return Promise.resolve(this.toIceCreams(queryOutput.Items));
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async getIceCreams(): Promise<IceCream[]> {
    try {
      let queryOutput = await this.db
        .query({
          TableName: "IceCream",
          IndexName: "IceCream-Name-Index",
          KeyConditionExpression: "SK = :sk",
          ExpressionAttributeValues: {
            ":sk": "ICE-CREAM",
          },
        })
        .promise();
      return Promise.resolve(this.toIceCreams(queryOutput.Items));
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  private toIceCreams(items: undefined | ItemList): IceCream[] {
    let iceCreams: undefined | IceCream[] = items
      ? items.map((item) => this.toIceCream(item))
      : [];
    return iceCreams;
  }

  private toIceCream(item: AttributeMap): IceCream {
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
      await this.db
        .put({
          TableName: "IceCream",
          Item: {
            PK: `ICE-CREAM#${iceCream.id}`,
            SK: "ICE-CREAM",
            Id: iceCream.id,
            Name: iceCream.name.toLowerCase(),
            Ingredients: iceCream.ingredients,
          },
        })
        .promise();
      return Promise.resolve(iceCream.id);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async saveOrder(order: Order): Promise<String> {
    order.id = uuidv4();
    try {
      await this.db
        .put({
          TableName: "IceCream",
          Item: {
            PK: `CUSTOMER#${order.customerId}`,
            SK: `ORDER#${order.id}`,
          },
        })
        .promise();
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }

    for (let orderItem of order.orderItems) {
      try {
        await this.db
          .put({
            TableName: "IceCream",
            Item: {
              PK: `ORDER#${order.id}`,
              SK: `ICE-CREAM#${orderItem.itemId}`,
              Quantity: orderItem.quantity,
              UnitPrice: orderItem.unitPrice,
            },
          })
          .promise();
      } catch (err) {
        console.error(err);
        return Promise.reject(err);
      }
    }

    return Promise.resolve(order.id);
  }
}
