import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    // TODO: Implement actual user validation against database
    // For now, return mock user for development
    const mockUser = {
      id: '1',
      email: 'admin@tradingfloor.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Admin User',
      role: 'Admin',
      orgId: '1',
    };

    if (email === mockUser.email && await bcrypt.compare(password, mockUser.password)) {
      const { password, ...result } = mockUser;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, orgId: user.orgId };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newPayload = { email: payload.email, sub: payload.sub, role: payload.role, orgId: payload.orgId };
      
      return {
        accessToken: this.jwtService.sign(newPayload),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
