import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import DynamoIceCreamService from "./dynamoIceCreamService";
import Order from "./order";

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let service: DynamoIceCreamService = new DynamoIceCreamService(db);

  console.log("Creating order:%s", event.body);

  if (event.body) {
    let order: Order = JSON.parse(event.body);
    let id = await service.saveOrder(order);
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
