import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import IceCream from "./iceCream";
import DynamoIceCreamService from "./dynamoIceCreamService";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const db = DynamoDBDocument.from(new DynamoDB({}));

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let service: DynamoIceCreamService = new DynamoIceCreamService(db);
  let id: string | undefined = event.pathParameters?.id;
  console.log("Getting ice cream:%s", id);
  let iceCream: IceCream | undefined = id
    ? await service.getIceCreamById(id)
    : undefined;
  return {
    statusCode: iceCream ? 200 : 404,
    body: iceCream ? JSON.stringify(iceCream) : "",
  };
};
