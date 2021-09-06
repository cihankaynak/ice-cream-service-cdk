import IceCream from "./iceCream";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { CognitoUserPoolsAuthorizer } from "@aws-cdk/aws-apigateway";

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
            id: id,
          },
        })
        .promise();
      console.log("Item %s is retrieved", item.Item);
      return Promise.resolve(<IceCream>item.Item);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async getIceCreamsByName(name: string): Promise<IceCream[]> {
    try {
      let scanOutput = await this.db
        .query({
          TableName: "IceCream",
          IndexName: "IceCream-Name-Index",
          KeyConditionExpression: "#n = :name",
          ExpressionAttributeValues: {
            ":name": name,
          },
          ExpressionAttributeNames: {
            "#n": "name",
          },
        })
        .promise();
      return Promise.resolve(<IceCream[]>scanOutput.Items);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  async getIceCreams(): Promise<IceCream[]> {
    try {
      let scanOutput = await this.db
        .scan({
          TableName: "IceCream",
        })
        .promise();
      return Promise.resolve(<IceCream[]>scanOutput.Items);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }
  async saveIceCream(iceCream: IceCream): Promise<string> {
    console.log("Creating %s in dynamoDB", iceCream);
    iceCream.id = uuidv4();
    try {
      await this.db
        .put({
          TableName: "IceCream",
          Item: iceCream,
        })
        .promise();
      return Promise.resolve(iceCream.id);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }
}
