import OrderItem from "./orderItem";

export default class Order {
  public id: string;

  constructor(
    public readonly customerId: string,
    public readonly orderItems: OrderItem[]
  ) {}
}
