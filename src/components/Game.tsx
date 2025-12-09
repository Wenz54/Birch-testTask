import { useState, useContext, useEffect } from 'react';
import { RotateCcw, LogOut } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import Board from './Board';
import ResultModal from './ResultModal';
import { calculateWinner, getComputerMove } from '../utils/gameLogic';

type CellValue = 'X' | 'O' | null;

interface GameState {
  board: CellValue[];
  isXNext: boolean;
  winner: CellValue | null;
}

const Game: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    isXNext: true,
    winner: null,
  });
  const [showResult, setShowResult] = useState(false);

  const winner = calculateWinner(gameState.board);

  // Computer move effect
  useEffect(() => {
    if (!gameState.isXNext && !winner) {
      const timer = setTimeout(() => {
        const computerMoveIndex = getComputerMove(gameState.board);
        if (computerMoveIndex !== -1) {
          const newBoard = [...gameState.board];
          newBoard[computerMoveIndex] = 'O';
          const newWinner = calculateWinner(newBoard);
          
          if (newWinner === 'O') {
            setShowResult(true);
            setGameState({
              board: newBoard,
              isXNext: true,
              winner: newWinner,
            });
            // No notification on loss
          } else if (newBoard.every((cell) => cell !== null)) {
            setShowResult(true);
            setGameState({
              board: newBoard,
              isXNext: true,
              winner: null,
            });
            // Send draw notification
            notifyTelegram('draw');
          } else {
            setGameState({
              board: newBoard,
              isXNext: true,
              winner: null,
            });
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isXNext, gameState.board, winner, user]);

  const handleCellClick = (index: number) => {
    if (gameState.board[index] || winner) return;

    const newBoard = [...gameState.board];
    newBoard[index] = 'X';
    const newWinner = calculateWinner(newBoard);

    if (newWinner) {
      setShowResult(true);
      setGameState({
        board: newBoard,
        isXNext: false,
        winner: newWinner,
      });
      // Send to Telegram (promo code generated on server)
      notifyTelegram('win');
    } else if (newBoard.every((cell) => cell !== null)) {
      setShowResult(true);
      setGameState({
        board: newBoard,
        isXNext: false,
        winner: null,
      });
      // Send draw notification
      notifyTelegram('draw');
    } else {
      setGameState({
        board: newBoard,
        isXNext: false,
        winner: null,
      });
    }
  };

  const handleReset = () => {
    setGameState({
      board: Array(9).fill(null),
      isXNext: true,
      winner: null,
    });
    setShowResult(false);
  };

  const handleLogout = () => {
    setUser(null);
    handleReset();
  };

  const notifyTelegram = async (type: 'win' | 'loss' | 'draw') => {
    try {
      if (!user?.chatId) return;
      
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await fetch(`${API_URL}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: user.chatId,
          type,
        }),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const isBoardFull = gameState.board.every((cell) => cell !== null);
  const isGameOver = winner || isBoardFull;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-violet-900 tracking-tight mb-1">
            Крестики-нолики
          </h1>
          <p className="text-sm text-violet-700/70">
            Привет, <span className="font-medium text-violet-800">{user?.username}</span>
          </p>
        </div>

        {/* Game Board */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
          <Board
            board={gameState.board}
            onCellClick={handleCellClick}
            disabled={!gameState.isXNext || isGameOver}
          />

          {/* Game Status */}
          <div className="mt-6 text-center">
            {winner === 'X' ? (
              <p className="text-xl font-light text-violet-600">Вы выиграли! 🎉</p>
            ) : winner === 'O' ? (
              <p className="text-xl font-light text-violet-700">Компьютер выиграл</p>
            ) : (isBoardFull && !winner) ? (
              <p className="text-xl font-light text-violet-700">Ничья!</p>
            ) : (
              <p className="text-sm text-violet-700/70">
                {gameState.isXNext ? 'Ваш ход' : 'Ход компьютера...'}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw size={18} />
            Новая игра
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-violet-100 hover:bg-violet-200 text-violet-800 font-medium py-3 px-4 rounded-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Выход
          </button>
        </div>
      </div>

      {/* Result Modal - Semi-transparent overlay */}
      {showResult && (
        <ResultModal
          type={winner === 'X' ? 'win' : winner === 'O' ? 'loss' : 'draw'}
          onClose={handleReset}
        />
      )}
    </div>
  );
};

export default Game;
