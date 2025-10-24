export class OrderItemResponseDto {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export class OrderResponseDto {
  id: string;
  customerId: string;
  items: OrderItemResponseDto[];
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
