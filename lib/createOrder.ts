import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import DynamoIceCreamService from "./dynamoIceCreamService";
import Order from "./order";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const db = DynamoDBDocument.from(new DynamoDB({}));

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
