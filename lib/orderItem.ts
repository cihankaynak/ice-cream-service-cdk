export default class OrderItem {
  constructor(
    public readonly itemId: string,
    public readonly quantity: number,
    public readonly unitPrice: number
  ) {}
}
