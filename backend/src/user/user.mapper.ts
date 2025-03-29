import { UserEntity } from './user.entity';
import { User } from './user.model';

export const modelToUser = (user: UserEntity): User => {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  };
};
