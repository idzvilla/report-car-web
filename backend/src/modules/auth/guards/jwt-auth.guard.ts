import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../../common/supabase/supabase.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Токен авторизации не найден');
    }

    const token = authorization.replace('Bearer ', '');

    try {
      const { data, error } = await this.supabaseService.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException('Недействительный токен');
      }

      // Добавляем пользователя в request для использования в контроллерах
      request.user = data.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Ошибка авторизации');
    }
  }
}
