import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiProperty({
    example: { color: 'red', size: 'M', material: 'cotton' },
    description: 'Key-value pairs defining this variant combination',
  })
  @IsObject()
  attributes: Record<string, string>;

  @ApiProperty({ example: 34.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 'TSHIRT-RED-M-COT' })
  @IsString()
  @IsOptional()
  sku?: string;
}
