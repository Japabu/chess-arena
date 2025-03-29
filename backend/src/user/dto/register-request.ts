import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterUserRequest {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
