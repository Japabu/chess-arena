import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { JwtPayload } from './jwt';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly saltRounds = 10;

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    if (
      await this.userRepository.findOneBy({
        username: adminUsername,
      })
    ) {
      return;
    }

    await this.userRepository.save(
      this.userRepository.create({
        username: adminUsername,
        passwordHash: await bcrypt.hash(adminPassword, this.saltRounds),
        roles: ['admin'],
      }),
    );
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

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

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

  async register(username: string, password: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const newUser = this.userRepository.create({
      username,
      passwordHash: hashedPassword,
    });

    await this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    return user;
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
