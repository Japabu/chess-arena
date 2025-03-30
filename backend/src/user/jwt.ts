import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Type,
  mixin,
} from '@nestjs/common';
import { UserService } from './user.service';

export function AuthGuard(requiredRoles?: string[]): Type<CanActivate> {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(private userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();

      const authHeader = request.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('No authorization header provided');
      }

      const [type, token] = authHeader.split(' ');

      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid token format');
      }

      try {
        const payload = await this.userService.verifyToken(token);
        request.user = payload;

        if (requiredRoles && requiredRoles?.length > 0) {
          if (
            !payload.roles ||
            !requiredRoles.some((role) => payload.roles.includes(role))
          ) {
            throw new UnauthorizedException(
              `Required roles: ${requiredRoles.join(', ')}`,
            );
          }
        }

        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  return mixin(AuthGuardMixin);
}

export interface JwtPayload {
  id: number;
  username: string;
  roles: string[];
}
