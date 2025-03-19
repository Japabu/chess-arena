import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

// Interface for admin credentials
interface AdminCredentials {
  username: string;
  password: string;
}

// JWT payload interface
export interface JwtPayload {
  id: number;
  username: string;
  roles: string[];
}

@Injectable()
export class UserService {
  private readonly adminCredentials: AdminCredentials;
  private readonly saltRounds = 10;

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    // Hardcoded admin credentials - in a real app these would be stored securely
    this.adminCredentials = {
      username: configService.get<string>('ADMIN_USERNAME', 'admin'),
      password: configService.get<string>('ADMIN_PASSWORD', 'chessmaster'),
    };
  }

  async validateAdmin(username: string, password: string): Promise<boolean> {
    // Simple validation against hardcoded credentials
    if (
      username === this.adminCredentials.username &&
      password === this.adminCredentials.password
    ) {
      return true;
    }
    return false;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const isAdmin = await this.validateAdmin(username, password);

    if (isAdmin) {
      return {
        access_token: this.createToken({
          id: -1,
          username,
          roles: ['admin'],
        }),
      };
    }

    const user = await this.userRepository.findOne({
      where: { username: username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.createToken({
        id: user.id,
        username,
        roles: user.roles,
      }),
    };
  }

  async register(username: string, password: string): Promise<{ id: number }> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const newUser = this.userRepository.create({
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    return {
      id: newUser.id,
    };
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    // Remove passwords from the response
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return null;
    }

    // Remove password from the response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  createToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verifyAsync<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
