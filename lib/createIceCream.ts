import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import IceCream from "./iceCream";
import * as AWS from "aws-sdk";
import DynamoIceCreamService from "./dynamoIceCreamService";

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let service: DynamoIceCreamService = new DynamoIceCreamService(db);

  if (event.body) {
    let iceCream: IceCream = JSON.parse(event.body);
    console.log("Creating %s", iceCream);
    let id = await service.saveIceCream(iceCream);
    return {
      statusCode: 200,
      body: JSON.stringify({ id: id }),
    };
  } else {
    return {
      statusCode: 400,
      body: "",
    };
  }
};
