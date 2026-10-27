import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Basmati Rice 1kg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Product SKU or Barcode', example: 'PROD-001' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Product category', example: 'Grains' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Price per unit', example: 120 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Current available stock', example: 50, default: 0 })
  @IsNumber()
  @Min(0)
  stock: number;
}