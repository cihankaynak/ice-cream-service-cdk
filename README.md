# ice-cream-service

Sample AWS Lambda app which demonstrates simple CRUD operations for an ice cream shop.

- Created by aws-cdk.
- Backed by DynamoDB.
- Applies single table design.

- [getIceCreams.ts](lib/getIceCreams.ts)
  - Returns list of ice creams.
  - Supports querying by name as well.
- [getIceCreamById.ts](lib/getIceCreams.ts)
  - Returns an ice cream by id.
- [createIceCream.ts](lib/createIceCream.ts)
  - Creates an ice cream.
- [createOrder.ts](lib/createOrder.ts)
  - Creates an order of ice creams.

Sample http requests can be found in [test/integration](/test/integration) folder.
