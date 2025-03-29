import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

// JWT payload interface
export interface JwtPayload {
  id: number;
  username: string;
  roles: string[];
}

@Injectable()
export class UserService implements OnModuleInit {
  private readonly saltRounds = 10;

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.ensureAdminExists();
  }

  private async ensureAdminExists() {
    const adminUsername =
      this.configService.getOrThrow<string>('ADMIN_USERNAME');
    const adminPassword =
      this.configService.getOrThrow<string>('ADMIN_PASSWORD');

    const existingAdmin = await this.userRepository.findOne({
      where: { username: adminUsername },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, this.saltRounds);

      const admin = this.userRepository.create({
        username: adminUsername,
        password: hashedPassword,
        roles: ['admin'],
      });

      await this.userRepository.save(admin);
    } else if (!existingAdmin.roles.includes('admin')) {
      // If user exists but doesn't have admin role, add it
      existingAdmin.roles = [...existingAdmin.roles, 'admin'];
      await this.userRepository.save(existingAdmin);
    }
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
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
