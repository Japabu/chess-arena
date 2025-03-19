import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginRequest {
  @ApiProperty({
    example: 'admin',
    description: 'Username for authentication',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: 'password',
    description: 'Password for authentication',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
