import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface MessagePayload {
  message?: unknown;
}

function hasMessagePayload(value: unknown): value is MessagePayload {
  return typeof value === 'object' && value !== null && 'message' in value;
}

function removeMessage<T>(
  value: T & MessagePayload,
): Omit<T & MessagePayload, 'message'> {
  const data = { ...value };

  delete data.message;

  return data;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T | Omit<T & MessagePayload, 'message'>>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T | Omit<T & MessagePayload, 'message'>>> {
    return next.handle().pipe(
      map((responseData: T) => {
        const message =
          hasMessagePayload(responseData) &&
          typeof responseData.message === 'string'
            ? responseData.message
            : 'Request successful';

        if (hasMessagePayload(responseData)) {
          return {
            success: true,
            message,
            data: removeMessage(responseData),
          };
        }

        return {
          success: true,
          message,
          data: responseData,
        };
      }),
    );
  }
}
