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

    const createOrderHandler = new lambdaNodeJs.NodejsFunction(
      this,
      "createOrder",
      {
        entry: "./lib/createOrder.ts",
      }
    );

    const api = new apigateway.RestApi(this, "ice-cream-service-api", {
      restApiName: "Ice Cream Service",
      description: "This service serves ice creams.",
    });

    const getIceCreamsIntegration = new apigateway.LambdaIntegration(
      getIceCreamsHandler
    );

    const getIceCreamByIdIntegration = new apigateway.LambdaIntegration(
      getIceCreamByIdHandler
    );

    const createIceCreamIntegration = new apigateway.LambdaIntegration(
      createIceCreamHandler
    );

    const createOrderIntegration = new apigateway.LambdaIntegration(
      createOrderHandler
    );

    table.grantReadData(getIceCreamsHandler);
    table.grantReadData(getIceCreamByIdHandler);
    table.grantWriteData(createIceCreamHandler);
    table.grantWriteData(createOrderHandler);

    // get all or by name
    let iceCreamResource = api.root.addResource("icecream");
    iceCreamResource.addMethod("GET", getIceCreamsIntegration);

    // post ice cream
    iceCreamResource.addMethod("POST", createIceCreamIntegration);

    // get by id
    const iceCreamResourceById = iceCreamResource.addResource("{id}");
    iceCreamResourceById.addMethod("GET", getIceCreamByIdIntegration);

    // post order
    let orderResource = api.root.addResource("order");
    orderResource.addMethod("POST", createOrderIntegration);
  }

  private createDatabase(): dynamodb.Table {
    const iceCreamTable = new dynamodb.Table(this, "ice-cream-table", {
      tableName: "IceCream",
      billingMode: dynamodb.BillingMode.PROVISIONED,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
    });

    // add global secondary index
    iceCreamTable.addGlobalSecondaryIndex({
      indexName: "IceCream-Name-Index",
      partitionKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "Name", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    return iceCreamTable;
  }
}
