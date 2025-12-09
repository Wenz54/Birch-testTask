import { useState, useContext } from 'react';
import { Send } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Registration: React.FC = () => {
  const { setUser } = useContext(UserContext);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [authStarted, setAuthStarted] = useState(false);

  const BOT_USERNAME = 'Test_bot_for_code_bot';

  const handleStartAuth = () => {
    setAuthStarted(true);
    // Открываем чат с ботом
    window.open(`https://t.me/${BOT_USERNAME}?start=auth`, '_blank');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!code.trim()) {
      setError('Пожалуйста, введите код');
      setLoading(false);
      return;
    }

    if (!username.trim()) {
      setError('Пожалуйста, введите ваше имя');
      setLoading(false);
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Неверный код');
        return;
      }

      // Успешная авторизация
      setUser({
        username: username.trim(),
        chatId: data.chatId,
      });
    } catch (err) {
      setError('Ошибка при проверке кода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-10 space-y-8 border border-rose-100/50">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-5xl font-light text-rose-900 tracking-tight">
              Крестики-нолики
            </h1>
            <p className="text-base text-rose-700/70 font-light">
              Играйте и выигрывайте эксклюзивные промокоды
            </p>
          </div>

          {!authStarted ? (
            <>
              {/* Initial Button */}
              <button
                onClick={handleStartAuth}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-medium py-3.5 px-6 rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Войти через Telegram
              </button>

              {/* Info */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-200/50">
                <p className="text-sm text-rose-800 text-center font-light leading-relaxed">
                  Нажмите кнопку выше. Бот отправит вам код входа в Telegram.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Code Form */}
              <form onSubmit={handleVerifyCode} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-rose-900 mb-2.5">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите ваше имя"
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 focus:outline-none transition text-rose-900 placeholder-rose-400 bg-white/80"
                  />
                </div>

                {/* Code Input */}
                <div>
                  <label className="block text-sm font-medium text-rose-900 mb-2.5">
                    Код входа из Telegram
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Например: ABC123"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 focus:outline-none transition text-rose-900 placeholder-rose-400 font-mono text-center text-lg bg-white/80"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-medium py-3.5 px-6 rounded-xl transition transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  {loading ? 'Проверка...' : 'Войти'}
                </button>
              </form>

              {/* Info */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-200/50">
                <p className="text-sm text-rose-800 text-center font-light">
                  Код действует 10 минут и одноразовый
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
