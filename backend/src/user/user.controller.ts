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
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { LoginRequest } from './dto/login-request.dto';
import { LoginResponse } from './dto/login-response.dto';
import { RegisterUserRequest } from './dto/register-request';
import { RegisterUserResponse } from './dto/register-response';
import { AuthGuard } from './jwt.guard';
import { User } from './user.entity';
import { GetUsersResponse } from './dto/get-users-response.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and retrieve a JWT token' })
  @ApiBody({
    type: LoginRequest,
    description: 'User credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'The JWT token that can be used for authenticated requests',
    type: LoginResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    return this.userService.login(loginRequest.username, loginRequest.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserRequest })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created',
    type: RegisterUserResponse,
  })
  async register(
    @Body() registerRequest: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    const { id } = await this.userService.register(
      registerRequest.username,
      registerRequest.password,
    );
    return { id, username: registerRequest.username };
  }

  @UseGuards(AuthGuard(['admin']))
  @Get()
  @ApiOperation({ summary: 'Get all users (admin view)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: GetUsersResponse,
  })
  async getUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard(['admin']))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the user to delete',
    schema: { type: 'integer' },
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(+id);
  }
}
