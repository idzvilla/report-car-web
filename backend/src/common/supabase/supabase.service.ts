import { Injectable } from '@nestjs/common';

@Injectable()
export class SupabaseService {
  // Заглушка для тестирования
  getClient() {
    return {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
        insert: () => ({ select: () => ({ single: () => ({ data: { id: '1' }, error: null }) }) }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
      }),
      auth: {
        getUser: (token: string) => ({ data: { user: { id: '1', email: 'test@example.com' } }, error: null }),
      },
    };
  }
}