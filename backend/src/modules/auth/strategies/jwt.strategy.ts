import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { SupabaseService } from '../../../common/supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private supabaseService: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    try {
      // Проверяем токен через Supabase
      const { data, error } = await this.supabaseService
        .getClient()
        .auth
        .getUser(payload.access_token);

      if (error || !data.user) {
        throw new UnauthorizedException('Недействительный токен');
      }

      return {
        sub: data.user.id,
        email: data.user.email,
        accessToken: payload.access_token,
        user: data.user,
      };
    } catch (error) {
      throw new UnauthorizedException('Ошибка валидации токена');
    }
  }
}
