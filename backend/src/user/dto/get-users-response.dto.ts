import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';

export class GetUsersResponse {
  @ApiProperty({ type: [User] })
  users: User[];

  constructor(users: User[]) {
    this.users = users;
  }
}
