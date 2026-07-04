import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @Length(10, 10)
  mobile: string;

  @ApiProperty()
  @IsString()
  @Length(6, 20)
  password: string;
}