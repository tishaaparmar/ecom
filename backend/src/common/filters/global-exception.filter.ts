import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  path: string;
  timestamp: string;
}

interface RequestContext {
  url?: string;
  method?: string;
}

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
}

function isHttpExceptionBody(value: unknown): value is HttpExceptionBody {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestContext>();
    const { statusCode, message, errors } = this.resolveException(exception);

    this.logger.error(
      `${request.method ?? 'UNKNOWN'} ${request.url ?? ''} ${statusCode} ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: ErrorResponse = {
      success: false,
      message,
      path: request.url ?? '',
      timestamp: new Date().toISOString(),
    };

    if (errors.length > 0) {
      body.errors = errors;
    }

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    errors: string[];
  } {
    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaException(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid database query',
        errors: [],
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errors: [],
    };
  }

  private resolveHttpException(exception: HttpException): {
    statusCode: number;
    message: string;
    errors: string[];
  } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        statusCode,
        message: exceptionResponse,
        errors: [],
      };
    }

    if (isHttpExceptionBody(exceptionResponse)) {
      const responseMessage = exceptionResponse.message;

      if (Array.isArray(responseMessage)) {
        return {
          statusCode,
          message: statusCode === 400 ? 'Validation failed' : exception.message,
          errors: responseMessage,
        };
      }

      return {
        statusCode,
        message: responseMessage ?? exception.message,
        errors: [],
      };
    }

    return {
      statusCode,
      message: exception.message,
      errors: [],
    };
  }

  private resolvePrismaException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): {
    statusCode: number;
    message: string;
    errors: string[];
  } {
    if (exception.code === 'P2002') {
      const target = Array.isArray(exception.meta?.target)
        ? exception.meta.target.join(', ')
        : 'record';

      return {
        statusCode: HttpStatus.CONFLICT,
        message: `${target} already exists`,
        errors: [],
      };
    }

    if (exception.code === 'P2025') {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Record not found',
        errors: [],
      };
    }

    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Database request failed',
      errors: [],
    };
  }
}
