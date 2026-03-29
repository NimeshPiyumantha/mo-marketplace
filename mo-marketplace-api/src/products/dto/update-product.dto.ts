import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Classic T-Shirt V2' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'An updated comfortable cotton t-shirt' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 34.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({ example: 'Apparel' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'https://example.com/tshirt-v2.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
