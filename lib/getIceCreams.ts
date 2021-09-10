import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import IceCream from "./iceCream";
import DynamoIceCreamService from "./dynamoIceCreamService";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const db = DynamoDBDocument.from(new DynamoDB({}));

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let service = new DynamoIceCreamService(db);
  let name = event.queryStringParameters?.name;
  let iceCreams: IceCream[] = name
    ? await service.getIceCreamsByName(name)
    : await service.getIceCreams();

  return {
    statusCode: iceCreams.length == 0 ? 404 : 200,
    body: JSON.stringify(iceCreams),
  };
};
