import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuickBuyDto {
  @ApiProperty({ description: 'The variant ID to purchase' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
