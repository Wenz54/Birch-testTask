const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;
const TELEGRAM_BOT_TOKEN = '8597043480:AAG4eWat92A9YC4NFZnpVn-8fCxuUmy58B0';

// Store promo codes (in production use a database)
const promoCodes = new Map();

// Store auth codes and sessions
const authCodes = new Map(); // { code: { chatId, createdAt, used } }
const sessions = new Map(); // { sessionToken: { chatId, username, createdAt } }

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Helper function to send Telegram message
const sendTelegramMessage = (chatId, message) => {
  return new Promise((resolve, reject) => {
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Telegram API error: ${response.statusCode}`));
        }
      });
    });

    request.on('error', reject);
    request.write(JSON.stringify(payload));
    request.end();
  });
};

// Generate unique promo code
const generatePromoCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Generate auth code (6 characters)
const generateAuthCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Generate session token
const generateSessionToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// ============ AUTH ENDPOINTS ============

// POST /api/auth/request-code
// Бот вызывает этот endpoint, чтобы создать код входа для пользователя
app.post('/api/auth/request-code', async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    // Генерируем код входа
    const code = generateAuthCode();
    
    // Сохраняем код (действует 10 минут)
    authCodes.set(code, {
      chatId,
      createdAt: Date.now(),
      used: false,
    });

    // Удаляем код через 10 минут
    setTimeout(() => {
      authCodes.delete(code);
    }, 10 * 60 * 1000);

    res.json({ 
      success: true, 
      code,
      message: 'Auth code created'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-code
// Сайт вызывает этот endpoint для проверки кода
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const authData = authCodes.get(code.toUpperCase());

    if (!authData) {
      return res.status(404).json({ error: 'Invalid or expired code' });
    }

    if (authData.used) {
      return res.status(400).json({ error: 'Code already used' });
    }

    // Проверяем, не истек ли код (10 минут)
    const codeAge = Date.now() - authData.createdAt;
    if (codeAge > 10 * 60 * 1000) {
      authCodes.delete(code.toUpperCase());
      return res.status(400).json({ error: 'Code expired' });
    }

    // Отмечаем код как использованный
    authData.used = true;

    // Генерируем сессию
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, {
      chatId: authData.chatId,
      createdAt: Date.now(),
    });

    // Сессия действует 7 дней
    setTimeout(() => {
      sessions.delete(sessionToken);
    }, 7 * 24 * 60 * 60 * 1000);

    res.json({ 
      success: true, 
      sessionToken,
      chatId: authData.chatId,
      message: 'Code verified'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-session
// Проверка валидности сессии
app.post('/api/auth/verify-session', (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    const session = sessions.get(sessionToken);

    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.json({ 
      success: true, 
      chatId: session.chatId,
      message: 'Session valid'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ GAME ENDPOINTS ============

// API endpoint for notifications
app.post('/api/notify', async (req, res) => {
  try {
    const { chatId, type } = req.body;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    let message = '';
    let promoCode = null;

    if (type === 'win') {
      // Generate unique promo code
      promoCode = generatePromoCode();
      
      // Store promo code (in production, save to database)
      promoCodes.set(promoCode, {
        chatId,
        createdAt: new Date(),
        used: false,
      });

      message = `🎉 <b>Поздравляем!</b>\n\nВы выиграли в крестики-нолики!\n\n<code>${promoCode}</code>\n\nВаш промокод на скидку готов к использованию!`;
    } else if (type === 'loss') {
      message = '😢 Вы проиграли в крестики-нолики. Попробуйте ещё раз!';
    } else if (type === 'draw') {
      message = '🤝 Ничья! Хорошая партия. Сыграйте ещё раз!';
    }

    // Send message to Telegram
    await sendTelegramMessage(chatId, message);
    
    res.json({ 
      success: true, 
      message: 'Notification sent',
      promoCode: promoCode ? promoCode : undefined
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// API endpoint to verify promo code
app.post('/api/verify-promo', (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const promoData = promoCodes.get(code);

    if (!promoData) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    if (promoData.used) {
      return res.status(400).json({ error: 'Promo code already used' });
    }

    // Mark as used
    promoData.used = true;
    promoCodes.set(code, promoData);

    res.json({ 
      success: true, 
      message: 'Promo code verified',
      chatId: promoData.chatId
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Telegram Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 20)}...`);
});
