import { Component, createEffect, createSignal } from 'solid-js';
import { Chess, Square } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  size?: number;
  interactive?: boolean;
}

const ChessBoard: Component<ChessBoardProps> = (props) => {
  const [position, setPosition] = createSignal<Chess>();
  const [boardSize, setBoardSize] = createSignal(props.size || 400);
  
  // Initialize chess position from FEN
  createEffect(() => {
    try {
      const chess = new Chess(props.fen);
      setPosition(chess);
    } catch (error) {
      console.error('Invalid FEN string:', props.fen, error);
      // Set to initial position if FEN is invalid
      setPosition(new Chess());
    }
  });
  
  const getPieceClass = (piece: { type: string, color: string }) => {
    const pieceType = piece.type.toLowerCase();
    const color = piece.color === 'w' ? 'w' : 'b';
    return `${color}${pieceType}`;
  };
  
  const renderSquare = (row: number, col: number) => {
    const isLightSquare = (row + col) % 2 === 0;
    const squareClass = isLightSquare ? 'chess-square-light' : 'chess-square-dark';
    const squareNotation = String.fromCharCode(97 + col) + (8 - row) as Square;
    
    let pieceClass = '';
    if (position()) {
      const piece = position()!.get(squareNotation);
      if (piece) {
        pieceClass = getPieceClass(piece);
      }
    }
    
    return (
      <div 
        class={`relative flex-1 flex justify-center items-center ${squareClass} transition-colors duration-200`} 
        data-square={squareNotation}
      >
        {pieceClass && (
          <div 
            class="w-full h-full bg-center bg-no-repeat bg-contain select-none transition-transform duration-150 hover:scale-105"
            style={{ "background-image": `url('/assets/pieces/${pieceClass}.svg')` }}
          ></div>
        )}
      </div>
    );
  };
  
  const renderBoard = () => {
    const board = [];
    
    // Files notation (a-h)
    const filesNotation = (
      <div class="flex justify-around px-1 py-1">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
          <div class="w-full text-center chess-notation">{file}</div>
        ))}
      </div>
    );
    
    // Build board with rank notation (1-8)
    for (let row = 0; row < 8; row++) {
      const squareRow = [];
      
      // Rank notation
      squareRow.push(
        <div class="w-6 chess-notation">
          {8 - row}
        </div>
      );
      
      // Chess squares
      for (let col = 0; col < 8; col++) {
        squareRow.push(renderSquare(row, col));
      }
      
      // Rank notation on right side
      squareRow.push(
        <div class="w-6 chess-notation">
          {8 - row}
        </div>
      );
      
      board.push(<div class="flex flex-1">{squareRow}</div>);
    }
    
    return (
      <div class="flex flex-col">
        <div class="flex">
          <div class="w-6"></div>
          {filesNotation}
          <div class="w-6"></div>
        </div>
        {board}
        <div class="flex">
          <div class="w-6"></div>
          {filesNotation}
          <div class="w-6"></div>
        </div>
      </div>
    );
  };
  
  return (
    <div class="chess-board">
      <div 
        class="rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 card-hover"
        style={{ width: `${boardSize() + 48}px` }}
      >
        {renderBoard()}
      </div>
    </div>
  );
};

export default ChessBoard;
