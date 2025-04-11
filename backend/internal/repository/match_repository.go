package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jan/chess-arena/go-backend/internal/models"
)

// MatchRepository provides access to match data in the database
type MatchRepository struct {
	db *sql.DB
}

// NewMatchRepository creates a new match repository
func NewMatchRepository(db *sql.DB) *MatchRepository {
	return &MatchRepository{
		db: db,
	}
}

// FindByID finds a match by ID
func (r *MatchRepository) FindByID(id int) (*models.Match, error) {
	var match models.Match
	var whiteID, blackID sql.NullInt64
	var status string

	row := r.db.QueryRow(`
		SELECT id, white_id, black_id, moves, fen, status, created_at, updated_at
		FROM matches
		WHERE id = $1
	`, id)

	err := row.Scan(
		&match.ID,
		&whiteID,
		&blackID,
		&match.Moves,
		&match.FEN,
		&status,
		&match.CreatedAt,
		&match.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("match with ID %d not found", id)
		}
		return nil, fmt.Errorf("error querying match: %w", err)
	}

	if whiteID.Valid {
		match.WhiteID = int(whiteID.Int64)
	}

	if blackID.Valid {
		match.BlackID = int(blackID.Int64)
	}

	match.Status = models.MatchStatus(status)
	return &match, nil
}

// FindWithPlayers finds a match by ID and loads player data
func (r *MatchRepository) FindWithPlayers(id int) (*models.Match, error) {
	match, err := r.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Load white player
	if match.WhiteID != 0 {
		var white models.User
		var roles []string

		whiteRow := r.db.QueryRow(`
			SELECT id, username, password_hash, roles, created_at, updated_at
			FROM users
			WHERE id = $1
		`, match.WhiteID)

		err := whiteRow.Scan(
			&white.ID,
			&white.Username,
			&white.PasswordHash,
			&roles,
			&white.CreatedAt,
			&white.UpdatedAt,
		)

		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("error querying white player: %w", err)
		}

		if err == nil {
			white.Roles = roles
			match.White = &white
		}
	}

	// Load black player
	if match.BlackID != 0 {
		var black models.User
		var roles []string

		blackRow := r.db.QueryRow(`
			SELECT id, username, password_hash, roles, created_at, updated_at
			FROM users
			WHERE id = $1
		`, match.BlackID)

		err := blackRow.Scan(
			&black.ID,
			&black.Username,
			&black.PasswordHash,
			&roles,
			&black.CreatedAt,
			&black.UpdatedAt,
		)

		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("error querying black player: %w", err)
		}

		if err == nil {
			black.Roles = roles
			match.Black = &black
		}
	}

	return match, nil
}

// Create creates a new match
func (r *MatchRepository) Create(match *models.Match) error {
	now := time.Now()
	match.CreatedAt = now
	match.UpdatedAt = now
	match.FEN = models.InitialFenPosition
	match.Status = models.MatchStatusPending

	err := r.db.QueryRow(`
		INSERT INTO matches (white_id, black_id, moves, fen, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`, match.WhiteID, match.BlackID, match.Moves, match.FEN, match.Status, match.CreatedAt, match.UpdatedAt).Scan(&match.ID)

	if err != nil {
		return fmt.Errorf("error creating match: %w", err)
	}

	return nil
}

// Update updates an existing match
func (r *MatchRepository) Update(match *models.Match) error {
	match.UpdatedAt = time.Now()

	_, err := r.db.Exec(`
		UPDATE matches
		SET white_id = $1, black_id = $2, moves = $3, fen = $4, status = $5, updated_at = $6
		WHERE id = $7
	`, match.WhiteID, match.BlackID, match.Moves, match.FEN, match.Status, match.UpdatedAt, match.ID)

	if err != nil {
		return fmt.Errorf("error updating match: %w", err)
	}

	return nil
}

// Delete deletes a match
func (r *MatchRepository) Delete(id int) error {
	_, err := r.db.Exec(`
		DELETE FROM matches
		WHERE id = $1
	`, id)

	if err != nil {
		return fmt.Errorf("error deleting match: %w", err)
	}

	return nil
}

// ListAll lists all matches
func (r *MatchRepository) ListAll() ([]*models.Match, error) {
	rows, err := r.db.Query(`
		SELECT id, white_id, black_id, moves, fen, status, created_at, updated_at
		FROM matches
		ORDER BY id
	`)
	if err != nil {
		return nil, fmt.Errorf("error querying matches: %w", err)
	}
	defer rows.Close()

	matches := []*models.Match{}
	for rows.Next() {
		var match models.Match
		var whiteID, blackID sql.NullInt64
		var status string

		err := rows.Scan(
			&match.ID,
			&whiteID,
			&blackID,
			&match.Moves,
			&match.FEN,
			&status,
			&match.CreatedAt,
			&match.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning match: %w", err)
		}

		if whiteID.Valid {
			match.WhiteID = int(whiteID.Int64)
		}

		if blackID.Valid {
			match.BlackID = int(blackID.Int64)
		}

		match.Status = models.MatchStatus(status)
		matches = append(matches, &match)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating matches: %w", err)
	}

	return matches, nil
}

// FindByUser finds all matches for a specific user
func (r *MatchRepository) FindByUser(userID int) ([]*models.Match, error) {
	rows, err := r.db.Query(`
		SELECT id, white_id, black_id, moves, fen, status, created_at, updated_at
		FROM matches
		WHERE white_id = $1 OR black_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying matches: %w", err)
	}
	defer rows.Close()

	matches := []*models.Match{}
	for rows.Next() {
		var match models.Match
		var whiteID, blackID sql.NullInt64
		var status string

		err := rows.Scan(
			&match.ID,
			&whiteID,
			&blackID,
			&match.Moves,
			&match.FEN,
			&status,
			&match.CreatedAt,
			&match.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning match: %w", err)
		}

		if whiteID.Valid {
			match.WhiteID = int(whiteID.Int64)
		}

		if blackID.Valid {
			match.BlackID = int(blackID.Int64)
		}

		match.Status = models.MatchStatus(status)
		matches = append(matches, &match)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating matches: %w", err)
	}

	return matches, nil
} 