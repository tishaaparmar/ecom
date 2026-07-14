import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../config/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(private prisma: PrismaService) {}

  // Register Customer
  async register(dto: CreateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingCustomer) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const customer = await this.prisma.customer.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Customer ${customer.id} registered`);

    return customer;
  }

  // Get All Customers
  findAll() {
    return this.prisma.customer.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Get Customer By ID
  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findProfile(id: number) {
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    const data: Prisma.CustomerUpdateInput = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const customer = await this.prisma.customer.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Customer ${customer.id} updated`);

    return customer;
  }

  // Delete Customer
  async remove(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const deletedCustomer = await this.prisma.customer.delete({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    this.logger.log(`Customer ${deletedCustomer.id} deleted`);

    return deletedCustomer;
  }
}
