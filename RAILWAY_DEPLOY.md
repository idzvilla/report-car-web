# 🚀 Деплой на Railway - Пошаговая инструкция

## 📋 **Подготовка:**

✅ **1. Все файлы готовы:**
- `Dockerfile` - многоэтапная сборка
- `railway.json` - конфигурация Railway  
- `.dockerignore` - исключения для Docker
- `RAILWAY_ENV.md` - переменные среды

✅ **2. Локальная сборка работает:**
```bash
npm run build  # ✅ Успешно завершено
```

## 🔧 **Шаги деплоя:**

### **1️⃣ Подключение к Railway**

1. Зайдите на **https://railway.app**
2. Подключите свой **GitHub аккаунт** 
3. Создайте **новый проект**
4. Выберите **"Deploy from GitHub repo"**
5. Выберите репозиторий **CarFax Web**

### **2️⃣ Настройка переменных среды**

В Railway Dashboard → Variables → добавьте:

```env
# Обязательные переменные
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Базовые настройки
NODE_ENV=production
PORT=3000

# Опционально (для CORS)
CORS_ORIGIN=https://your-app.railway.app
```

### **3️⃣ Конфигурация проекта**

Railway автоматически обнаружит:
- ✅ `railway.json` конфигурацию
- ✅ `Dockerfile` для сборки
- ✅ Health check на `/api/health`

### **4️⃣ Деплой**

1. **Push в main ветку** - автоматический деплой
2. **Или нажмите "Deploy"** в Railway Dashboard
3. **Ожидайте сборку** (~5-10 минут)

## 🔍 **Проверка после деплоя:**

### **Основные эндпоинты:**
- 🏥 **Health**: `https://your-app.railway.app/api/health`
- 📚 **Swagger**: `https://your-app.railway.app/api/docs`
- 🏠 **Frontend**: `https://your-app.railway.app/`

### **API тестирование:**
```bash
# Health check
curl https://your-app.railway.app/api/health

# Регистрация
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'
```

## 🚨 **Возможные проблемы:**

### **❌ Build fails:**
- Проверьте логи в Railway Dashboard
- Убедитесь, что `package.json` скрипты корректны
- Проверьте `Dockerfile` синтаксис

### **❌ App crashes:**
- Проверьте переменные среды  
- Убедитесь, что Supabase URL и ключи правильные
- Проверьте логи приложения

### **❌ CORS errors:**
- Добавьте `CORS_ORIGIN` переменную
- Укажите домен Railway приложения

## 📊 **Мониторинг:**

В Railway Dashboard доступны:
- 📈 **Логи в реальном времени**
- 📊 **Метрики CPU/Memory**  
- 🔄 **История деплоев**
- ⚡ **Масштабирование**

## 🎯 **Готово!**

После успешного деплоя ваше приложение будет доступно 24/7 на Railway с автоматическими обновлениями при каждом push в GitHub! 🚀