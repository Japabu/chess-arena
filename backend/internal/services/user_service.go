package services

import (
	"errors"
	"fmt"

	"github.com/jan/chess-arena/go-backend/internal/auth"
	"github.com/jan/chess-arena/go-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// UserRepository defines the interface for user data access
type UserRepository interface {
	FindByID(id int) (*models.User, error)
	FindByUsername(username string) (*models.User, error)
	Create(user *models.User) error
	Update(user *models.User) error
	Delete(id int) error
	ListAll() ([]*models.User, error)
}

// UserService handles business logic related to users
type UserService struct {
	repo       UserRepository
	jwtService *auth.JWTService
}

// NewUserService creates a new user service
func NewUserService(repo UserRepository, jwtService *auth.JWTService) *UserService {
	return &UserService{
		repo:       repo,
		jwtService: jwtService,
	}
}

// GetUserByID retrieves a user by their ID
func (s *UserService) GetUserByID(id int) (*models.User, error) {
	if id <= 0 {
		return nil, errors.New("invalid user ID")
	}
	return s.repo.FindByID(id)
}

// CreateUser creates a new user
func (s *UserService) CreateUser(input *models.CreateUserInput) (*models.User, error) {
	// Check if username already exists
	existingUser, err := s.repo.FindByUsername(input.Username)
	if err == nil && existingUser != nil {
		return nil, errors.New("username already taken")
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("error hashing password: %w", err)
	}

	// Create the user
	user := &models.User{
		Username:     input.Username,
		PasswordHash: string(hashedPassword),
		Roles:        []string{"user"},
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

// Authenticate authenticates a user and returns a JWT token
func (s *UserService) Authenticate(input *models.LoginUserInput) (string, error) {
	// Find user by username
	user, err := s.repo.FindByUsername(input.Username)
	if err != nil {
		return "", errors.New("invalid username or password")
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return "", errors.New("invalid username or password")
	}

	// Generate JWT token
	token, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return "", fmt.Errorf("error generating token: %w", err)
	}

	return token, nil
}

// ListUsers lists all users
func (s *UserService) ListUsers() ([]*models.User, error) {
	return s.repo.ListAll()
}

// UpdateUserRole updates a user's roles
func (s *UserService) UpdateUserRole(id int, roles []string) error {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	user.Roles = roles
	return s.repo.Update(user)
}

// DeleteUser deletes a user
func (s *UserService) DeleteUser(id int) error {
	return s.repo.Delete(id)
}

// ChangePassword changes a user's password
func (s *UserService) ChangePassword(id int, currentPassword, newPassword string) error {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	// Check current password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword))
	if err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error hashing password: %w", err)
	}

	user.PasswordHash = string(hashedPassword)
	return s.repo.Update(user)
} 