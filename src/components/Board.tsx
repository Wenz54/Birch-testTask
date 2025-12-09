import React from 'react';

type CellValue = 'X' | 'O' | null;

interface BoardProps {
  board: CellValue[];
  onCellClick: (index: number) => void;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, disabled }) => {
  const renderCell = (value: CellValue, index: number) => {
    const isX = value === 'X';
    const isO = value === 'O';

    return (
      <button
        key={index}
        onClick={() => onCellClick(index)}
        disabled={disabled || value !== null}
        className={`
          w-20 h-20 rounded-lg font-light text-4xl transition-all
          ${
            disabled || value !== null
              ? 'cursor-not-allowed'
              : 'cursor-pointer hover:bg-violet-100/50'
          }
          ${isX ? 'bg-violet-100/60 text-violet-600 font-medium' : ''}
          ${isO ? 'bg-purple-100/60 text-purple-600 font-medium' : ''}
          ${!value ? 'bg-white/50 border border-violet-200/50 hover:border-violet-300/70 hover:bg-white/70' : ''}
          shadow-sm
        `}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-violet-50/30 to-purple-50/30 p-3 rounded-xl">
      {board.map((value, index) => renderCell(value, index))}
    </div>
  );
};

export default Board;
