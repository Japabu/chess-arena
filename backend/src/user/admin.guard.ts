import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // Make sure the user is authenticated and has admin role
    if (!request.user) {
      return false;
    }

    return this.checkIfAdmin(request.user.id);
  }

  private async checkIfAdmin(userId: number): Promise<boolean> {
    try {
      const user = await this.userService.findOne(userId);
      return user?.isAdmin === true;
    } catch {
      return false;
    }
  }
}
