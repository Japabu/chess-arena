import { IsString, IsNotEmpty } from 'class-validator';

export class UserResponse {
  id: number;
  username: string;
  createdAt: string;

  constructor(id: number, username: string, createdAt: string) {
    this.id = id;
    this.username = username;
    this.createdAt = createdAt;
  }
}

export class GetUsersResponse {
  users: UserResponse[];

  constructor(users: UserResponse[]) {
    this.users = users;
  }
}

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class LoginResponse {
  access_token: string;

  constructor(access_token: string) {
    this.access_token = access_token;
  }
}

export class RegisterUserRequest {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
