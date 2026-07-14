import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'iPhone 16 Pro',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Apple flagship phone',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'IPH16PRO256',
  })
  @IsString()
  sku: string;

  @ApiProperty({
    example: 99999,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    example: 50,
  })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({
    example: 'https://example.com/iphone.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 1,
  })
  @IsInt()
  categoryId: number;
}