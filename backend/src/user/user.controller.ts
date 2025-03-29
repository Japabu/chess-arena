import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  UseGuards,
  Get,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  UserResponse,
} from './user.dto';
import { AuthGuard } from './jwt.guard';
import { User } from './user.model';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(loginRequest.username, loginRequest.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerRequest: RegisterUserRequest): Promise<void> {
    await this.userService.register(
      registerRequest.username,
      registerRequest.password,
    );
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponse> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return new UserResponse(
      user.id,
      user.username,
      user.createdAt.toISOString(),
    );
  }
}

// ==========================================
// Admin Endpoints
// ==========================================
@UseGuards(AuthGuard(['admin']))
@Controller('admin/users')
export class UserAdminController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
