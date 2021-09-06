import * as cdk from "@aws-cdk/core";
import * as iceCreamServiceConstruct from "./iceCreamServiceConstruct";

export class IceCreamServiceCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new iceCreamServiceConstruct.IceCreamServiceConstruct(
      this,
      "IceCreamService"
    );
  }
}
