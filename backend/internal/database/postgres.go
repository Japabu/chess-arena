package database

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/jan/chess-arena/go-backend/internal/config"
	_ "github.com/lib/pq" // PostgreSQL driver
)

// PostgresDB provides access to the PostgreSQL database
type PostgresDB struct {
	db *sql.DB
}

// NewPostgresDB creates a new PostgreSQL database connection
func NewPostgresDB(cfg *config.Config) (*PostgresDB, error) {
	var connStr string
	
	// Use POSTGRES_URL if provided, otherwise build from individual fields
	if cfg.Database.URL != "" {
		connStr = cfg.Database.URL
	} else {
		connStr = fmt.Sprintf(
			"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
			cfg.Database.Host,
			cfg.Database.Port,
			cfg.Database.User,
			cfg.Database.Password,
			cfg.Database.Name,
		)
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("error opening database connection: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Check if database connection is working
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error connecting to database: %w", err)
	}

	return &PostgresDB{db: db}, nil
}

// Close closes the database connection
func (p *PostgresDB) Close() error {
	return p.db.Close()
}

// GetDB returns the underlying database connection
func (p *PostgresDB) GetDB() *sql.DB {
	return p.db
}

// InitSchema initializes the database schema
func (p *PostgresDB) InitSchema() error {
	// Create users table
	_, err := p.db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(255) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			roles TEXT[] NOT NULL DEFAULT '{user}',
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating users table: %w", err)
	}

	// Create matches table
	_, err = p.db.Exec(`
		CREATE TABLE IF NOT EXISTS matches (
			id SERIAL PRIMARY KEY,
			white_id INTEGER REFERENCES users(id),
			black_id INTEGER REFERENCES users(id),
			moves TEXT NOT NULL DEFAULT '',
			fen TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
			status VARCHAR(20) NOT NULL DEFAULT 'pending',
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating matches table: %w", err)
	}

	// Create tournaments table
	_, err = p.db.Exec(`
		CREATE TABLE IF NOT EXISTS tournaments (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'open',
			start_date TIMESTAMP WITH TIME ZONE,
			end_date TIMESTAMP WITH TIME ZONE,
			user_ids INTEGER[] NOT NULL DEFAULT '{}',
			created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating tournaments table: %w", err)
	}

	// Create tournament_matches table
	_, err = p.db.Exec(`
		CREATE TABLE IF NOT EXISTS tournament_matches (
			id SERIAL PRIMARY KEY,
			tournament_id INTEGER REFERENCES tournaments(id),
			match_id INTEGER REFERENCES matches(id),
			round INTEGER NOT NULL
		)
	`)
	if err != nil {
		return fmt.Errorf("error creating tournament_matches table: %w", err)
	}

	return nil
} 