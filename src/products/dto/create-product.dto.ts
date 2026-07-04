export class CreateProductDto {
  name: string;
  code?: string;
  category?: string;
  price: number;
  stock: number;
}