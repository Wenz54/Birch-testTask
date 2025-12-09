import React from 'react';
import { Trophy, Heart, RotateCcw } from 'lucide-react';

interface ResultModalProps {
  type: 'win' | 'loss' | 'draw';
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ type, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center px-4 z-50 animate-fade-in-scale">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        {type === 'win' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Trophy className="w-14 h-14 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-violet-900 mb-2">Вы выиграли!</h2>
              <p className="text-sm text-violet-700/70">Промокод отправлен в Telegram</p>
            </div>
          </div>
        )}

        {type === 'loss' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Heart className="w-14 h-14 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-violet-900 mb-2">Компьютер выиграл</h2>
              <p className="text-sm text-violet-700/70">Не расстраивайтесь! Попробуйте ещё раз.</p>
            </div>
          </div>
        )}

        {type === 'draw' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Heart className="w-14 h-14 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-violet-900 mb-2">Ничья!</h2>
              <p className="text-sm text-violet-700/70">Хорошая партия! Сыграйте ещё раз.</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
        >
          <RotateCcw size={18} />
          Новая игра
        </button>
      </div>
    </div>
  );
};

export default ResultModal;
