import { SupabaseClient } from '@supabase/supabase-js';

export class ReportProcessor {
  constructor(private supabase: SupabaseClient) {}

  async handleCompletedReport(reportId: string, userId: string) {
    try {
      // Проверяем, есть ли у пользователя bulk пакет с оставшимися credits
      const { data: userCredits, error: creditsError } = await this.supabase
        .from('user_credits')
        .select('credits_remaining')
        .eq('user_id', userId)
        .gt('credits_remaining', 0)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Ошибка проверки credits:', creditsError);
        return;
      }

      // Если у пользователя есть credits, используем один
      if (userCredits && userCredits.credits_remaining > 0) {
        await this.useCredit(userId, userCredits.credits_remaining);
        console.log(`💳 Использован credit для пользователя ${userId}`);
      } else {
        console.log(`💰 Отчёт ${reportId} готов к оплате`);
      }
    } catch (error) {
      console.error('Ошибка обработки завершённого отчёта:', error);
    }
  }

  private async useCredit(userId: string, currentCredits: number) {
    try {
      const { error } = await this.supabase
        .from('user_credits')
        .update({ 
          credits_remaining: currentCredits - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Ошибка обновления credits: ${error.message}`);
      }
    } catch (error) {
      console.error('Ошибка использования credit:', error);
      throw error;
    }
  }
}
