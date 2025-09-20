# API Спецификация CarFax Web

## Базовый URL
```
http://localhost:3000/api/v1
```

## Аутентификация

Все защищённые эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <jwt_token>
```

## Эндпоинты

### Аутентификация

#### POST /auth/register
Регистрация нового пользователя.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Иван Иванов"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-12-01T10:00:00Z"
  },
  "message": "Пользователь успешно зарегистрирован"
}
```

#### POST /auth/login
Вход пользователя.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Иван Иванов"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST /auth/logout
Выход пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Успешный выход"
}
```

#### POST /auth/refresh
Обновление токена.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token"
  }
}
```

#### GET /auth/me
Получение информации о текущем пользователе.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Иван Иванов",
    "createdAt": "2024-12-01T10:00:00Z",
    "credits": {
      "credits_total": 100,
      "credits_remaining": 95
    }
  }
}
```

#### POST /auth/update-email
Обновление email пользователя.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "new@example.com",
  "password": "current_password"
}
```

**Response:**
```json
{
  "message": "Email успешно обновлен"
}
```

### Отчёты

#### POST /reports/request
Запрос отчёта по VIN.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vin": "1HGBH41JXMN109186"
}
```

**Response:**
```json
{
  "reportId": "uuid",
  "status": "available|payment_required|generating",
  "downloadUrl": "https://...", // если status = "available"
  "price": 2.00, // если status = "payment_required"
  "message": "Отчёт генерируется..." // если status = "generating"
}
```

#### GET /reports/:id
Получение информации об отчёте.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "vin": "1HGBH41JXMN109186",
  "user_id": "uuid",
  "status": "completed",
  "price": 2.00,
  "pdf_file_name": "vin-report-1HGBH41JXMN109186-uuid.pdf",
  "generated_at": "2024-12-01T10:30:00Z",
  "created_at": "2024-12-01T10:00:00Z",
  "updated_at": "2024-12-01T10:30:00Z",
  "downloadUrl": "https://..."
}
```

#### GET /reports/:id/download
Получение ссылки для скачивания отчёта.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "downloadUrl": "https://storage.supabase.co/object/sign/reports-pdfs/..."
}
```

#### GET /reports
Получение списка отчётов пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "vin": "1HGBH41JXMN109186",
    "status": "completed",
    "price": 2.00,
    "created_at": "2024-12-01T10:00:00Z",
    "generated_at": "2024-12-01T10:30:00Z"
  }
]
```

### Платежи

#### POST /payments/create
Создание платежа.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reportId": "uuid", // только для single платежа
  "paymentType": "single|bulk"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentId": "uuid",
  "amount": 2.00,
  "currency": "usd"
}
```

#### POST /payments/webhook
Webhook для обработки событий Stripe.

**Headers:** `Stripe-Signature: <signature>`

**Request Body:** Raw Stripe webhook payload

**Response:**
```json
{
  "received": true
}
```

#### GET /payments
Получение истории платежей пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "report_id": "uuid",
    "payment_type": "single",
    "amount": 2.00,
    "stripe_payment_intent_id": "pi_xxx",
    "status": "completed",
    "created_at": "2024-12-01T10:00:00Z"
  }
]
```

### Пользователи

#### GET /users/profile
Получение профиля пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Иван Иванов",
  "createdAt": "2024-12-01T10:00:00Z",
  "credits": {
    "credits_total": 100,
    "credits_remaining": 95
  }
}
```

#### PUT /users/profile
Обновление профиля пользователя.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "Новое имя"
}
```

**Response:**
```json
{
  "message": "Профиль успешно обновлен",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Новое имя"
  }
}
```

#### GET /users/credits
Получение информации о credits пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "credits_total": 100,
  "credits_remaining": 95
}
```

### Администрирование

#### GET /admin/dashboard
Получение статистики дашборда.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalReports": 156,
  "totalUsers": 23,
  "totalPayments": 89,
  "totalRevenue": 1247.50,
  "recentReports": [
    {
      "id": "uuid",
      "vin": "1HGBH41JXMN109186",
      "status": "completed",
      "profiles": {
        "email": "user@example.com"
      },
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "recentUsers": [
    {
      "user_id": "uuid",
      "credits_total": 100,
      "credits_remaining": 95,
      "profiles": {
        "email": "user@example.com",
        "full_name": "Иван Иванов"
      },
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

#### GET /admin/users
Получение списка всех пользователей.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "user_id": "uuid",
    "credits_total": 100,
    "credits_remaining": 95,
    "created_at": "2024-12-01T10:00:00Z",
    "profiles": {
      "email": "user@example.com",
      "full_name": "Иван Иванов"
    }
  }
]
```

#### GET /admin/reports
Получение списка всех отчётов.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "vin": "1HGBH41JXMN109186",
    "user_id": "uuid",
    "status": "completed",
    "price": 2.00,
    "created_at": "2024-12-01T10:00:00Z",
    "profiles": {
      "email": "user@example.com",
      "full_name": "Иван Иванов"
    }
  }
]
```

#### PUT /admin/users/:userId/credits
Обновление credits пользователя.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "credits": 100
}
```

**Response:**
```json
{
  "message": "Credits успешно обновлены",
  "credits": 100
}
```

## Коды ошибок

### HTTP статус коды
- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Некорректные данные
- `401` - Не авторизован
- `403` - Нет доступа
- `404` - Ресурс не найден
- `409` - Конфликт (например, пользователь уже существует)
- `429` - Превышен лимит запросов
- `500` - Внутренняя ошибка сервера

### Формат ошибок
```json
{
  "statusCode": 400,
  "message": "Некорректные данные",
  "error": "Bad Request"
}
```

## Rate Limiting

- **Лимит:** 100 запросов в минуту
- **Заголовки ответа:**
  - `X-RateLimit-Limit` - максимальное количество запросов
  - `X-RateLimit-Remaining` - оставшиеся запросы
  - `X-RateLimit-Reset` - время сброса лимита

## Валидация данных

### VIN номер
- Длина: 17 символов
- Формат: только буквы и цифры (кроме I, O, Q)
- Регулярное выражение: `^[A-HJ-NPR-Z0-9]{17}$`

### Email
- Стандартная валидация email адреса
- Уникальность в системе

### Пароль
- Минимальная длина: 6 символов
- Максимальная длина: 50 символов

## Webhook события

### Stripe Webhooks
- `payment_intent.succeeded` - успешная оплата
- `payment_intent.payment_failed` - неудачная оплата

### Обработка webhook
1. Проверка подписи Stripe
2. Извлечение события
3. Обновление статуса платежа в БД
4. Обновление credits пользователя (для bulk платежей)
5. Активация отчёта (для single платежей)
