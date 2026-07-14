import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: number) {
    return this.prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: {
        id,
      },
      data: updateCategoryDto,
    });
  }

  async delete(id: number) {
    return this.prisma.category.delete({
      where: {
        id,
      },
    });
  }

  async findProducts(id: number) {
    return this.prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
      },
    });
  }
}
