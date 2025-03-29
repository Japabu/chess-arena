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
import { LoginRequest } from './dto/login-request.dto';
import { LoginResponse } from './dto/login-response.dto';
import { RegisterUserRequest } from './dto/register-request';
import { RegisterUserResponse } from './dto/register-response';
import { AuthGuard } from './jwt.guard';
import { User } from './user.entity';
import { GetUsersResponse } from './dto/get-users-response.dto';

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
  async register(
    @Body() registerRequest: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    const { id } = await this.userService.register(
      registerRequest.username,
      registerRequest.password,
    );
    return { id, username: registerRequest.username };
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
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
