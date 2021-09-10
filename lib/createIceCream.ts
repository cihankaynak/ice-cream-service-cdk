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

  console.log("Creating ice cream:%s", event.body);

  if (event.body) {
    let iceCream: IceCream = JSON.parse(event.body);
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
