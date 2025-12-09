const { Telegraf } = require('telegraf');

const BOT_TOKEN = '8597043480:AAG4eWat92A9YC4NFZnpVn-8fCxuUmy58B0';
const API_URL = process.env.API_URL || 'http://localhost:5000';

const bot = new Telegraf(BOT_TOKEN);

console.log('🤖 Initializing bot...');

// Middleware для логирования
bot.use((ctx, next) => {
  console.log(`📨 Message from ${ctx.chat?.id}: ${ctx.message?.text || ctx.message?.type || 'unknown'}`);
  return next();
});

// Обработка /start с параметром auth
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const startParam = ctx.startPayload;

  console.log(`🔐 /start called. ChatID: ${chatId}, Param: ${startParam}`);

  if (startParam === 'auth') {
    try {
      console.log(`📡 Requesting auth code for chatId: ${chatId}`);
      
      // Запрашиваем код у сервера
      const response = await fetch(`${API_URL}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chatId.toString() })
      });

      const data = await response.json();

      console.log(`✅ Auth code response:`, data);

      if (data.success) {
        // Отправляем код пользователю
        await ctx.reply(
          `🔐 <b>Ваш код входа:</b>\n\n<code>${data.code}</code>\n\n⏱️ Код действует 10 минут и одноразовый.`,
          { parse_mode: 'HTML' }
        );
        console.log(`✅ Code sent to ${chatId}`);
      } else {
        await ctx.reply('❌ Ошибка при получении кода. Попробуйте позже.');
        console.error('❌ Auth code error:', data);
      }
    } catch (error) {
      console.error('❌ Error requesting auth code:', error);
      await ctx.reply('❌ Ошибка при получении кода. Попробуйте позже.');
    }
  } else {
    // Обычный /start
    await ctx.reply(
      '👋 Добро пожаловать в игру "Крестики-нолики"!\n\n' +
      'Нажмите кнопку "Войти через Telegram" на сайте игры, и я отправлю вам код входа.',
      { parse_mode: 'HTML' }
    );
  }
});

// Обработка команды /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    '📖 <b>Справка:</b>\n\n' +
    '1️⃣ Нажмите "Войти через Telegram" на сайте\n' +
    '2️⃣ Я отправлю вам код входа\n' +
    '3️⃣ Введите код на сайте\n' +
    '4️⃣ Играйте и выигрывайте промокоды!\n\n' +
    '⚠️ Код действует 10 минут и одноразовый.',
    { parse_mode: 'HTML' }
  );
});

// Обработка команды /status
bot.command('status', async (ctx) => {
  await ctx.reply(
    '✅ Бот работает!\n\n' +
    'Используйте /help для справки.',
    { parse_mode: 'HTML' }
  );
});

// Обработка всех остальных сообщений
bot.on('message', async (ctx) => {
  await ctx.reply(
    '👋 Привет!\n\n' +
    'Я помогу вам войти в игру "Крестики-нолики".\n\n' +
    'Нажмите кнопку "Войти через Telegram" на сайте, и я отправлю вам код входа.\n\n' +
    'Команды:\n' +
    '/help - справка\n' +
    '/status - статус бота',
    { parse_mode: 'HTML' }
  );
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Error:', err);
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.').catch(() => {});
});

// Запуск бота
bot.launch();

console.log('🤖 Bot started!');
console.log(`📡 API URL: ${API_URL}`);
console.log('Press Ctrl+C to stop');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
