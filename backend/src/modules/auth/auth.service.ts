import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';

  constructor(
    private jwtService: JwtService,
    private supabaseService: SupabaseService
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(email: string, password: string, fullName: string) {
    try {
      console.log('Attempting to register user:', { email, fullName });
      
      const { data, error } = await this.supabaseService.signUp(email, password, {
        full_name: fullName
      });

      console.log('Supabase response:', { data: data ? 'DATA_PRESENT' : 'NO_DATA', error });

      if (error) {
        console.error('Supabase registration error:', error);
        if (error.message.includes('already registered')) {
          throw new ConflictException('Пользователь с таким email уже существует');
        }
        throw new UnauthorizedException(error.message);
      }

      if (!data.user) {
        throw new UnauthorizedException('Ошибка при создании пользователя');
      }

      // Создаем запись в нашей таблице users
      await this.createUserProfile(data.user.id, email, fullName);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: fullName,
          authProvider: 'email'
        },
        session: data.session
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Ошибка при регистрации');
    }
  }

  /**
   * Вход пользователя
   */
  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseService.signIn(email, password);

      if (error) {
        throw new UnauthorizedException('Неверный email или пароль');
      }

      if (!data.user || !data.session) {
        throw new UnauthorizedException('Ошибка авторизации');
      }

      // Получаем профиль пользователя
      const userProfile = await this.getUserProfile(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: userProfile?.full_name || 'User',
          authProvider: 'email',
          credits: {
            credits_total: userProfile?.credits_total || 0,
            credits_remaining: userProfile?.credits_remaining || 0
          }
        },
        session: data.session
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Ошибка при входе');
    }
  }

  /**
   * Выход пользователя
   */
  async logout() {
    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        throw new UnauthorizedException(error.message);
      }
      return { message: 'Успешный выход' };
    } catch (error) {
      throw new UnauthorizedException('Ошибка при выходе');
    }
  }

  /**
   * Получение пользователя по токену
   */
  async getUserByToken(accessToken: string) {
    try {
      const { data, error } = await this.supabaseService.getUser(accessToken);

      if (error || !data.user) {
        throw new UnauthorizedException('Недействительный токен');
      }

      const userProfile = await this.getUserProfile(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: userProfile?.full_name || 'User',
          authProvider: 'email',
          credits: {
            credits_total: userProfile?.credits_total || 0,
            credits_remaining: userProfile?.credits_remaining || 0
          }
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Ошибка при получении пользователя');
    }
  }

  /**
   * Создает профиль пользователя в нашей таблице
   */
  private async createUserProfile(userId: string, email: string, fullName: string) {
    const supabaseAdmin = this.supabaseService.getAdminClient();
    
    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        auth_provider: 'email',
        credits_total: 0,
        credits_remaining: 0,
        role: 'user'
      });

    if (error) {
      console.error('Error creating user profile:', error);
    } else {
      console.log('✅ User profile created successfully for:', email);
    }
  }

  /**
   * Получает профиль пользователя из нашей таблицы
   */
  private async getUserProfile(userId: string) {
    const supabaseAdmin = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data;
  }
}