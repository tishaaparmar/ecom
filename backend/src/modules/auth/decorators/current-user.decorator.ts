import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

interface AuthenticatedRequest {
  user: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
