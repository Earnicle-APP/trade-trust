import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, fullName: true },
    });

    if (!profile) {
      throw new UnauthorizedException('User no longer exists');
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      roles: payload.roles,
    };
  }
}
