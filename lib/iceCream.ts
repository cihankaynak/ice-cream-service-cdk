import Ingredient from "./ingredient";

export default class IceCream {
  private ingredients: Ingredient[] = [];

  constructor(public id: string, public readonly name: string) {}

  public add(ingredient: Ingredient): void {
    this.ingredients.push(ingredient);
  }
}
