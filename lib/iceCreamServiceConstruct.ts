import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class IceCreamServiceConstruct extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);
    this.createEndPoints(this.createDatabase());
  }

  private createEndPoints(table: dynamodb.Table): void {
    const getIceCreamsHandler = new lambdaNodeJs.NodejsFunction(
      this,
      "getIceCreams",
      {
        entry: "./lib/getIceCreams.ts",
      }
    );

    const getIceCreamByIdHandler = new lambdaNodeJs.NodejsFunction(
      this,
      "getIceCreamById",
      {
        entry: "./lib/getIceCreamById.ts",
      }
    );

    const createIceCreamHandler = new lambdaNodeJs.NodejsFunction(
      this,
      "createIceCream",
      {
        entry: "./lib/createIceCream.ts",
      }
    );

    const api = new apigateway.RestApi(this, "ice-cream-service-api", {
      restApiName: "Ice Cream Service",
      description: "This service serves ice creams.",
    });

    const getIceCreamsIntegration = new apigateway.LambdaIntegration(
      getIceCreamsHandler,
      {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' },
      }
    );

    const getIceCreamByIdIntegration = new apigateway.LambdaIntegration(
      getIceCreamByIdHandler
    );

    const createIceCreamByIdIntegration = new apigateway.LambdaIntegration(
      createIceCreamHandler
    );

    table.grantReadData(getIceCreamsHandler);
    table.grantReadData(getIceCreamByIdHandler);
    table.grantWriteData(createIceCreamHandler);

    // get all or by name
    api.root.addMethod("GET", getIceCreamsIntegration);

    // post ice cream
    api.root.addMethod("POST", createIceCreamByIdIntegration);

    // get by id
    const iceCreamResource = api.root.addResource("{id}");
    iceCreamResource.addMethod("GET", getIceCreamByIdIntegration);
  }

  private createDatabase(): dynamodb.Table {
    const iceCreamTable = new dynamodb.Table(this, "ice-cream-table", {
      tableName: "IceCream",
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    // 👇 add local secondary index
    iceCreamTable.addGlobalSecondaryIndex({
      indexName: "IceCream-Name-Index",
      partitionKey: { name: "name", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    return iceCreamTable;
  }
}
