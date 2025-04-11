package models

import (
	"time"
)

// MatchStatus represents the status of a chess match
type MatchStatus string

const (
	// MatchStatusPending indicates a match that hasn't started yet
	MatchStatusPending MatchStatus = "pending"
	// MatchStatusInProgress indicates a match that is currently being played
	MatchStatusInProgress MatchStatus = "in_progress"
	// MatchStatusWhiteWon indicates a match that white won
	MatchStatusWhiteWon MatchStatus = "white_won"
	// MatchStatusBlackWon indicates a match that black won
	MatchStatusBlackWon MatchStatus = "black_won"
	// MatchStatusDraw indicates a match that ended in a draw
	MatchStatusDraw MatchStatus = "draw"
	// MatchStatusAborted indicates a match that was aborted
	MatchStatusAborted MatchStatus = "aborted"
)

// InitialFenPosition is the starting position of a chess game in FEN notation
const InitialFenPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

// Match represents a chess match
type Match struct {
	ID        int         `json:"id"`
	WhiteID   int         `json:"whiteId"`
	BlackID   int         `json:"blackId"`
	White     *User       `json:"white,omitempty"`
	Black     *User       `json:"black,omitempty"`
	Moves     string      `json:"moves"`
	FEN       string      `json:"fen"`
	Status    MatchStatus `json:"status"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
}

// CreateMatchInput represents the data needed to create a new match
type CreateMatchInput struct {
	WhiteID int `json:"whiteId" validate:"required"`
	BlackID int `json:"blackId" validate:"required"`
}

// MakeMoveInput represents the data needed to make a move in a match
type MakeMoveInput struct {
	Move string `json:"move" validate:"required"`
}

// MatchResponse represents a chess match in API responses
type MatchResponse struct {
	ID        int         `json:"id"`
	WhiteID   int         `json:"whiteId"`
	BlackID   int         `json:"blackId"`
	White     *User       `json:"white,omitempty"`
	Black     *User       `json:"black,omitempty"`
	Moves     string      `json:"moves"`
	FEN       string      `json:"fen"`
	Status    MatchStatus `json:"status"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
}

// ToResponse converts a Match to a MatchResponse
func (m *Match) ToResponse() MatchResponse {
	response := MatchResponse{
		ID:        m.ID,
		WhiteID:   m.WhiteID,
		BlackID:   m.BlackID,
		Moves:     m.Moves,
		FEN:       m.FEN,
		Status:    m.Status,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}

	if m.White != nil {
		white := m.White.ToResponse()
		response.White = &User{
			ID:       white.ID,
			Username: white.Username,
			Roles:    white.Roles,
		}
	}

	if m.Black != nil {
		black := m.Black.ToResponse()
		response.Black = &User{
			ID:       black.ID,
			Username: black.Username,
			Roles:    black.Roles,
		}
	}

	return response
} 