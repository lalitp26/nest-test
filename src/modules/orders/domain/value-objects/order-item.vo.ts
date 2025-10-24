/**
 * Value Object for Order Item
 * Immutable and defined by its attributes, not identity
 */
export class OrderItem {
  private readonly _productId: string;
  private readonly _quantity: number;
  private readonly _price: number;

  constructor(productId: string, quantity: number, price: number) {
    this._productId = productId;
    this._quantity = quantity;
    this._price = price;
    this.validate();
  }

  validate(): void {
    if (!this._productId) {
      throw new Error('Product ID is required');
    }
    if (this._quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    if (this._price < 0) {
      throw new Error('Price cannot be negative');
    }
  }

  get productId(): string {
    return this._productId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get price(): number {
    return this._price;
  }

  get subtotal(): number {
    return this._quantity * this._price;
  }

  equals(other: OrderItem): boolean {
    return (
      this._productId === other._productId &&
      this._quantity === other._quantity &&
      this._price === other._price
    );
  }
}
