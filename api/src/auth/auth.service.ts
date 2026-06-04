import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const existing = await this.usersService.findByUsername(username);
    if (existing) throw new ConflictException('username taken');
    const user = await this.usersService.create(username, password);
    return this.sign(user);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const ok = await this.usersService.validatePassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid credentials');
    return this.sign(user);
  }

  private sign(user: any) {
    const payload = {
      sub: String(user._id),
      username: user.username,
      roles: user.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: String(user._id), username: user.username, roles: user.roles },
    };
  }
}
