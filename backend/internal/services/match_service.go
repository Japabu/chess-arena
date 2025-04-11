package services

import (
	"errors"
	"fmt"
	"strings"

	"github.com/jan/chess-arena/go-backend/internal/models"
)

// MatchRepository defines the interface for match data access
type MatchRepository interface {
	FindByID(id int) (*models.Match, error)
	FindWithPlayers(id int) (*models.Match, error)
	Create(match *models.Match) error
	Update(match *models.Match) error
	Delete(id int) error
	ListAll() ([]*models.Match, error)
	FindByUser(userID int) ([]*models.Match, error)
}

// MatchService handles business logic related to matches
type MatchService struct {
	repo MatchRepository
}

// NewMatchService creates a new match service
func NewMatchService(repo MatchRepository) *MatchService {
	return &MatchService{
		repo: repo,
	}
}

// GetMatchByID retrieves a match by its ID
func (s *MatchService) GetMatchByID(id int) (*models.Match, error) {
	return s.repo.FindWithPlayers(id)
}

// CreateMatch creates a new match
func (s *MatchService) CreateMatch(input *models.CreateMatchInput) (*models.Match, error) {
	// Validate input
	if input.WhiteID == input.BlackID {
		return nil, errors.New("white and black players must be different")
	}

	// Create the match
	match := &models.Match{
		WhiteID: input.WhiteID,
		BlackID: input.BlackID,
		Moves:   "",
		FEN:     models.InitialFenPosition,
		Status:  models.MatchStatusPending,
	}

	if err := s.repo.Create(match); err != nil {
		return nil, err
	}

	return s.repo.FindWithPlayers(match.ID)
}

// StartMatch starts a match
func (s *MatchService) StartMatch(id int) (*models.Match, error) {
	match, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if match.Status != models.MatchStatusPending {
		return nil, errors.New("match is not in pending status")
	}

	match.Status = models.MatchStatusInProgress
	if err := s.repo.Update(match); err != nil {
		return nil, err
	}

	return s.repo.FindWithPlayers(match.ID)
}

// MakeMove makes a move in a match
func (s *MatchService) MakeMove(id int, input *models.MakeMoveInput) (*models.Match, error) {
	match, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if match.Status != models.MatchStatusInProgress {
		return nil, errors.New("match is not in progress")
	}

	// In a real implementation, you would:
	// 1. Validate the move using a chess engine
	// 2. Update the FEN position
	// 3. Check for checkmate, stalemate, etc.

	// For now, we'll just append the move
	if match.Moves == "" {
		match.Moves = input.Move
	} else {
		match.Moves = match.Moves + " " + input.Move
	}

	// Update the FEN position (this would normally be done by a chess engine)
	// For this example, we'll just append a move number to the FEN
	moveCount := len(strings.Split(match.Moves, " "))
	match.FEN = fmt.Sprintf("%s (after move %d)", models.InitialFenPosition, moveCount)

	// Check for game end conditions (this would normally be done by a chess engine)
	// For this example, we'll just end the game after 10 moves
	if moveCount >= 10 {
		// Determine winner based on move count (just an example)
		if moveCount%2 == 0 {
			match.Status = models.MatchStatusWhiteWon
		} else {
			match.Status = models.MatchStatusBlackWon
		}
	}

	if err := s.repo.Update(match); err != nil {
		return nil, err
	}

	return s.repo.FindWithPlayers(match.ID)
}

// AbortMatch aborts a match
func (s *MatchService) AbortMatch(id int) error {
	match, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if match.Status != models.MatchStatusPending && match.Status != models.MatchStatusInProgress {
		return errors.New("match cannot be aborted")
	}

	match.Status = models.MatchStatusAborted
	return s.repo.Update(match)
}

// ListMatches lists all matches
func (s *MatchService) ListMatches() ([]*models.Match, error) {
	return s.repo.ListAll()
}

// GetUserMatches gets all matches for a specific user
func (s *MatchService) GetUserMatches(userID int) ([]*models.Match, error) {
	return s.repo.FindByUser(userID)
} 