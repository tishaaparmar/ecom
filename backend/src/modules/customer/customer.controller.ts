import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register customer',
  })
  register(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.register(createCustomerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated customer profile',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid bearer token',
  })
  profile(@CurrentUser() user: JwtPayload) {
    return this.customerService.findProfile(user.sub);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all customers',
  })
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get customer by id',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update customer by id',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete customer by id',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.remove(id);
  }
}
