import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chess, Square, Piece } from 'chess.js';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center p-2">
      <div class="rounded-lg overflow-hidden shadow-lg">
        <div class="flex flex-col">
          <!-- Render 8 rows -->
          <div *ngFor="let row of [0, 1, 2, 3, 4, 5, 6, 7]" class="flex">
            <!-- Render 8 squares in each row -->
            <div
              *ngFor="let square of getSquaresForRow(row)"
              [ngClass]="{
                'bg-[#f0d9b5]': (square.row + square.col) % 2 === 0,
                'bg-[#b58863]': (square.row + square.col) % 2 !== 0
              }"
              class="flex justify-center items-center"
              [style.width.px]="squareSize"
              [style.height.px]="squareSize"
              [attr.data-square]="square.notation"
            >
              <!-- Render piece if exists -->
              <div
                *ngIf="square.piece"
                class="w-full h-full bg-center bg-no-repeat bg-contain"
                [style.background-image]="
                  'url(' + getPieceImageUrl(square.piece) + ')'
                "
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ChessBoardComponent implements OnChanges, OnInit {
  @Input() fen: string =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Default starting position
  @Input() size: number = 400;
  @Input() interactive: boolean = false;

  position: Chess | null = null;
  squareSize: number = 50; // Default, will be calculated
  squares: {
    row: number;
    col: number;
    color: string;
    notation: Square;
    piece: Piece | null;
  }[] = [];

  // Make String available to the template
  String = String;

  ngOnInit(): void {
    this.initializeBoard();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fen'] || changes['size']) {
      this.initializeBoard();
    }
  }

  /**
   * Get all squares for a specific row
   */
  getSquaresForRow(row: number): {
    row: number;
    col: number;
    color: string;
    notation: Square;
    piece: Piece | null;
  }[] {
    return this.squares.filter((square) => square.row === row);
  }

  initializeBoard(): void {
    // Set square size
    this.squareSize = this.size / 8;

    // Initialize chess position from FEN
    try {
      this.position = new Chess(this.fen);
    } catch (error) {
      console.error('Invalid FEN string:', this.fen, error);
      // Set to initial position if FEN is invalid
      this.position = new Chess();
    }

    // Create squares array for rendering
    this.squares = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const squareColor = isLightSquare ? 'light' : 'dark';
        const squareNotation = (String.fromCharCode(97 + col) +
          (8 - row)) as Square;

        let piece: Piece | null = null;
        if (this.position) {
          const squarePiece = this.position.get(squareNotation);
          if (squarePiece) {
            piece = squarePiece;
          }
        }

        this.squares.push({
          row,
          col,
          color: squareColor,
          notation: squareNotation,
          piece,
        });
      }
    }
  }

  getPieceClass(piece: Piece | null): string {
    if (!piece) return '';

    const pieceType = piece.type.toLowerCase();
    const color = piece.color === 'w' ? 'w' : 'b';
    return `${color}${pieceType}`;
  }

  getPieceImageUrl(piece: Piece | null): string {
    if (!piece) return '';

    const pieceClass = this.getPieceClass(piece);
    return `/assets/pieces/${pieceClass}.svg`;
  }
}
