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
  const squareSize = () => boardSize() / 8;
  
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
    const squareColor = isLightSquare ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
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
        class={`${squareColor} flex justify-center items-center`} 
        style={{ width: `${squareSize()}px`, height: `${squareSize()}px` }}
        data-square={squareNotation}
      >
        {pieceClass && (
          <div 
            class="w-full h-full bg-center bg-no-repeat bg-contain"
            style={{ "background-image": `url('/assets/pieces/${pieceClass}.svg')` }}
          ></div>
        )}
      </div>
    );
  };
  
  const renderBoard = () => {
    const rows = [];
    
    // Build board
    for (let row = 0; row < 8; row++) {
      const squareRow = [];
      
      for (let col = 0; col < 8; col++) {
        squareRow.push(renderSquare(row, col));
      }
      
      rows.push(<div class="flex">{squareRow}</div>);
    }
    
    return (
      <div class="flex flex-col">
        {rows}
      </div>
    );
  };
  
  return (
    <div class="flex justify-center items-center p-2">
      <div class="rounded-lg overflow-hidden shadow-lg">
        {renderBoard()}
      </div>
    </div>
  );
};

export default ChessBoard;
