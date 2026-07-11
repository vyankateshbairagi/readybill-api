import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  amount: number;

  @IsString()
  paymentMode: string;

  @IsOptional()
  @IsString()
  note?: string;
}