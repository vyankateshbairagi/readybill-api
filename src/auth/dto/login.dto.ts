import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @Length(10, 10)
  mobile: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}