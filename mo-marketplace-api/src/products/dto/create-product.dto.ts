import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateVariantDto } from '../../variants/dto/create-variant.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Classic T-Shirt' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A comfortable cotton t-shirt' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 'Apparel' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'https://example.com/tshirt.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @IsOptional()
  variants?: CreateVariantDto[];
}
