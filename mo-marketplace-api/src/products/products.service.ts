import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Variant } from '../variants/entities/variant.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from '../variants/dto/create-variant.dto';
import { UpdateVariantDto } from '../variants/dto/update-variant.dto';
import { generateCombinationKey } from '../variants/combination-key.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Variant)
    private readonly variantRepo: Repository<Variant>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      basePrice: dto.basePrice,
      category: dto.category,
      imageUrl: dto.imageUrl,
    });

    const saved = await this.productRepo.save(product);

    if (dto.variants?.length) {
      const seenKeys = new Set<string>();
      for (const variantDto of dto.variants) {
        const combinationKey = generateCombinationKey(variantDto.attributes);
        if (seenKeys.has(combinationKey)) {
          throw new ConflictException(
            `Duplicate variant combination: "${combinationKey}"`,
          );
        }
        seenKeys.add(combinationKey);
      }

      const variants = dto.variants.map((v) =>
        this.variantRepo.create({
          ...v,
          combinationKey: generateCombinationKey(v.attributes),
          product: saved,
        }),
      );
      await this.variantRepo.save(variants);
    }

    return this.findOne(saved.id);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      relations: ['variants'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['variants'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    await this.productRepo.save(product);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
  }

  // --- Variant operations ---

  async addVariant(productId: string, dto: CreateVariantDto): Promise<Variant> {
    const product = await this.findOne(productId);
    const combinationKey = generateCombinationKey(dto.attributes);

    const existing = await this.variantRepo.findOne({
      where: { product: { id: productId }, combinationKey },
    });
    if (existing) {
      throw new ConflictException(
        `Variant combination "${combinationKey}" already exists for this product`,
      );
    }

    const variant = this.variantRepo.create({
      ...dto,
      combinationKey,
      product,
    });
    return this.variantRepo.save(variant);
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ): Promise<Variant> {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
    });
    if (!variant) {
      throw new NotFoundException(
        `Variant "${variantId}" not found for product "${productId}"`,
      );
    }

    Object.assign(variant, dto);
    return this.variantRepo.save(variant);
  }

  async removeVariant(productId: string, variantId: string): Promise<void> {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
    });
    if (!variant) {
      throw new NotFoundException(
        `Variant "${variantId}" not found for product "${productId}"`,
      );
    }
    await this.variantRepo.remove(variant);
  }

  async quickBuy(
    productId: string,
    variantId: string,
    quantity: number,
  ): Promise<{ success: boolean; message: string; variant: Variant }> {
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
      relations: ['product'],
    });
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    if (variant.stock < quantity) {
      throw new ConflictException(
        `Insufficient stock. Available: ${variant.stock}, Requested: ${quantity}`,
      );
    }

    variant.stock -= quantity;
    const updated = await this.variantRepo.save(variant);

    return {
      success: true,
      message: `Successfully purchased ${quantity}x ${variant.product.name} (${variant.combinationKey})`,
      variant: updated,
    };
  }
}
