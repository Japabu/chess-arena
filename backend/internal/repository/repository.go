package repository

// Repository defines the common interface for all data access layers
type Repository interface {
	// Common methods for repository operations could be defined here
	Close() error
}

// BaseRepository provides common functionality for all repositories
type BaseRepository struct {
	// Database connection or client would be stored here
}

// Close closes the repository's database connection
func (r *BaseRepository) Close() error {
	// Logic to close database connection would go here
	return nil
} 