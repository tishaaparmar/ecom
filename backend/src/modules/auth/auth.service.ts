import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Customer } from '@prisma/client';

import { PrismaService } from '../../config/prisma/prisma.service';
import { parseJwtExpiresIn } from '../../config/jwt.config';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

type SafeCustomer = Omit<Customer, 'password'>;

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: Pick<
    SafeCustomer,
    'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'address' | 'isActive'
  >;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      customer.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: customer.id,
      email: customer.email,
    };

    const expiresIn = parseJwtExpiresIn(
      this.configService.getOrThrow<string>('JWT_EXPIRES_IN'),
    );

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn,
    });

    this.logger.log(`Customer ${customer.id} logged in`);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        isActive: customer.isActive,
      },
    };
  }
}
