import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity as UserEntity } from './user.entity';

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
