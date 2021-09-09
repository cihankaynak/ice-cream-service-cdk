import Ingredient from "./ingredient";

export default class IceCream {
  constructor(
    public id: string,
    public readonly name: string,
    public readonly ingredients: Ingredient[] = []
  ) {}

  public add(ingredient: Ingredient): void {
    this.ingredients.push(ingredient);
  }
}
