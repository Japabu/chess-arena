package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jan/chess-arena/go-backend/internal/models"
	"github.com/lib/pq"
)

// UserRepository provides access to user data in the database
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// FindByID finds a user by ID
func (r *UserRepository) FindByID(id int) (*models.User, error) {
	var user models.User
	var roles []string

	row := r.db.QueryRow(`
		SELECT id, username, password_hash, roles, created_at, updated_at
		FROM users
		WHERE id = $1
	`, id)

	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.PasswordHash,
		pq.Array(&roles),
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user with ID %d not found", id)
		}
		return nil, fmt.Errorf("error querying user: %w", err)
	}

	user.Roles = roles
	return &user, nil
}

// FindByUsername finds a user by username
func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	var roles []string

	row := r.db.QueryRow(`
		SELECT id, username, password_hash, roles, created_at, updated_at
		FROM users
		WHERE username = $1
	`, username)

	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.PasswordHash,
		pq.Array(&roles),
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user with username %s not found", username)
		}
		return nil, fmt.Errorf("error querying user: %w", err)
	}

	user.Roles = roles
	return &user, nil
}

// Create creates a new user
func (r *UserRepository) Create(user *models.User) error {
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	err := r.db.QueryRow(`
		INSERT INTO users (username, password_hash, roles, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, user.Username, user.PasswordHash, pq.Array(user.Roles), user.CreatedAt, user.UpdatedAt).Scan(&user.ID)

	if err != nil {
		return fmt.Errorf("error creating user: %w", err)
	}

	return nil
}

// Update updates an existing user
func (r *UserRepository) Update(user *models.User) error {
	user.UpdatedAt = time.Now()

	_, err := r.db.Exec(`
		UPDATE users
		SET username = $1, password_hash = $2, roles = $3, updated_at = $4
		WHERE id = $5
	`, user.Username, user.PasswordHash, pq.Array(user.Roles), user.UpdatedAt, user.ID)

	if err != nil {
		return fmt.Errorf("error updating user: %w", err)
	}

	return nil
}

// Delete deletes a user
func (r *UserRepository) Delete(id int) error {
	_, err := r.db.Exec(`
		DELETE FROM users
		WHERE id = $1
	`, id)

	if err != nil {
		return fmt.Errorf("error deleting user: %w", err)
	}

	return nil
}

// ListAll lists all users
func (r *UserRepository) ListAll() ([]*models.User, error) {
	rows, err := r.db.Query(`
		SELECT id, username, password_hash, roles, created_at, updated_at
		FROM users
		ORDER BY id
	`)
	if err != nil {
		return nil, fmt.Errorf("error querying users: %w", err)
	}
	defer rows.Close()

	users := []*models.User{}
	for rows.Next() {
		var user models.User
		var roles []string

		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.PasswordHash,
			pq.Array(&roles),
			&user.CreatedAt,
			&user.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning user: %w", err)
		}

		user.Roles = roles
		users = append(users, &user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating users: %w", err)
	}

	return users, nil
} 