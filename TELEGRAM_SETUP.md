# Настройка авторизации через Telegram

## 1. Создание Telegram бота

1. Откройте Telegram и найдите бота [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Введите название бота (например: "CarFax Web Bot")
4. Введите username бота (например: "carfax_web_bot")
5. Скопируйте полученный токен бота

## 2. Настройка домена для бота

1. Отправьте команду `/setdomain` боту @BotFather
2. Выберите вашего бота из списка
3. Введите домен вашего сайта: `localhost:4200` (для разработки) или ваш продакшн домен

## 3. Настройка переменных окружения

Добавьте в файл `.env` в папке `backend`:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
JWT_SECRET=your_jwt_secret_here
```

## 4. Обновление Supabase схемы

Добавьте в таблицу `users` следующие поля:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_photo_url TEXT;
```

## 5. Тестирование

1. Запустите backend: `cd backend && npm run start:dev`
2. Запустите frontend: `cd frontend && npm start`
3. Откройте http://localhost:4200
4. Нажмите на кнопку "Войти через Telegram"
5. Авторизуйтесь в Telegram
6. Проверьте, что вы вошли в систему

## 6. Безопасность

- Токен бота должен храниться в переменных окружения
- Проверяйте подпись данных от Telegram на сервере
- Используйте HTTPS в продакшене
- Настройте CORS для вашего домена

## 7. Возможные проблемы

### Кнопка не отображается
- Проверьте, что домен настроен в @BotFather
- Убедитесь, что используете правильный username бота

### Ошибка "Неверная подпись"
- Проверьте правильность токена бота
- Убедитесь, что токен указан в переменных окружения

### Ошибка CORS
- Добавьте ваш домен в CORS настройки backend
- Проверьте, что frontend и backend работают на правильных портах
