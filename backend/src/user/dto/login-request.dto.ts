import { IsString, IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
