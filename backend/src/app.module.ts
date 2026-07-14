import * as Joi from 'joi';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

import { PrismaModule } from './config/prisma/prisma.module';
import { isValidJwtExpiresIn } from './config/jwt.config';

import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string()
          .custom((value: string, helpers) => {
            if (!isValidJwtExpiresIn(value)) {
              return helpers.error('any.invalid');
            }

            return value;
          }, 'JWT expiration validation')
          .required(),
        PORT: Joi.number().port().default(3000),
        CORS_ORIGIN: Joi.string().default('*'),
        THROTTLE_TTL: Joi.number().integer().positive().default(60000),
        THROTTLE_LIMIT: Joi.number().integer().positive().default(100),
      }),
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.getOrThrow<number>('THROTTLE_TTL'),
          limit: configService.getOrThrow<number>('THROTTLE_LIMIT'),
        },
      ],
    }),

    PrismaModule,

    CategoryModule,

    ProductModule,

    CustomerModule,

    AuthModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
