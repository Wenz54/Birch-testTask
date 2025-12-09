type CellValue = 'X' | 'O' | null;

export const calculateWinner = (board: CellValue[]): CellValue => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
};

export const getComputerMove = (board: CellValue[]): number => {
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = 'O';
      if (calculateWinner(testBoard) === 'O') {
        return i;
      }
    }
  }

  // Try to block player
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = 'X';
      if (calculateWinner(testBoard) === 'X') {
        return i;
      }
    }
  }

  // Take center if available
  if (board[4] === null) {
    return 4;
  }

  // Take corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Take any available space
  const available = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null) as number[];

  return available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : -1;
};
