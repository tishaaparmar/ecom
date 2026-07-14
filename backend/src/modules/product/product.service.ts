import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    this.logger.log(`Product ${product.id} created`);

    return product;
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    this.logger.log(`Product ${product.id} updated`);

    return product;
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.prisma.product.delete({
      where: { id },
    });

    this.logger.log(`Product ${product.id} deleted`);

    return product;
  }

  productsByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
      },
    });
  }
}
