import { ApiProperty } from '@nestjs/swagger';

export class LoginResponse {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token for authentication',
  })
  access_token: string;

  constructor(access_token: string) {
    this.access_token = access_token;
  }
}
