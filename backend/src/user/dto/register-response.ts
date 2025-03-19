import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserResponse {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  id: number;

  @ApiProperty({
    example: 'ChessBot3000',
    description: 'The username of the user',
  })
  username: string;

  constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
  }
}
