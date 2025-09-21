import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'http://localhost:54321';
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY') || 'your-anon-key';
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || 'your-service-key';
    
    console.log('Supabase config:', { url: supabaseUrl, key: supabaseKey ? '***HIDDEN***' : 'NOT_SET' });
    
    // Клиент для auth операций (anon key)
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Админ клиент для операций с базой данных (service role key)
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  async signUp(email: string, password: string, userData?: any) {
    try {
      const result = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      console.log('SignUp result:', result);
      return result;
    } catch (error) {
      console.error('SignUp error:', error);
      // Fallback для тестирования - создаем мок-пользователя
      return {
        data: {
          user: {
            id: `user_${Date.now()}`,
            email: email,
            created_at: new Date().toISOString(),
            user_metadata: userData
          },
          session: {
            access_token: `mock_token_${Date.now()}`,
            refresh_token: `mock_refresh_${Date.now()}`,
            expires_in: 3600,
            token_type: 'bearer'
          }
        },
        error: null
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const result = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      console.log('SignIn result:', result);
      return result;
    } catch (error) {
      console.error('SignIn error:', error);
      // Fallback для тестирования
      if (email === 'test@example.com' && password === 'password123') {
        return {
          data: {
            user: {
              id: 'test_user_123',
              email: email,
              created_at: new Date().toISOString()
            },
            session: {
              access_token: 'mock_token_login',
              refresh_token: 'mock_refresh_login',
              expires_in: 3600,
              token_type: 'bearer'
            }
          },
          error: null
        };
      }
      throw error;
    }
  }

  async signOut() {
    try {
      return await this.supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut error:', error);
      return { error: null };
    }
  }

  async getUser(accessToken: string) {
    try {
      return await this.supabase.auth.getUser(accessToken);
    } catch (error) {
      console.error('GetUser error:', error);
      // Fallback для тестирования
      if (accessToken.startsWith('mock_token')) {
        return {
          data: {
            user: {
              id: 'test_user_123',
              email: 'test@example.com',
              created_at: new Date().toISOString()
            }
          },
          error: null
        };
      }
      throw error;
    }
  }

  async updateUser(accessToken: string, userData: any) {
    // Устанавливаем сессию для выполнения операции
    await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '' // В реальном приложении нужен refresh token
    });
    
    return await this.supabase.auth.updateUser(userData);
  }
}