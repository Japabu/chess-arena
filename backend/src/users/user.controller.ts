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
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from './jwt';
import { IsString, IsNotEmpty } from 'class-validator';
import { User } from './user.entity';

export interface UserResponse {
  id: number;
  username: string;
  createdAt: string;
}

export interface GetUsersResponse {
  users: UserResponse[];
}

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export interface LoginResponse {
  access_token: string;
}

export class RegisterUserRequest {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export const userToResponse = (user: User): UserResponse => {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  };
};

@Controller('users')
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
      throw new NotFoundException('User not found');
    }
    return userToResponse(user);
  }
}
@UseGuards(AuthGuard(['admin']))
@Controller('admin/users')
export class UserAdminController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers(): Promise<GetUsersResponse> {
    return {
      users: (await this.userService.findAll()).map(userToResponse),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
