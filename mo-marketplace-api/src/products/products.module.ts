import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Variant } from '../variants/entities/variant.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Variant])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
