import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {

  @IsString()
  name: string;


  @IsString()
  mobile: string;


  @IsOptional()
  @IsNumber()
  openingBalance?: number;

}