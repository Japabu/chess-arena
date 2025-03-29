import { User } from '../user.entity';

export class GetUsersResponse {
  users: User[];

  constructor(users: User[]) {
    this.users = users;
  }
}
