package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/jan/chess-arena/go-backend/internal/config"
	"github.com/jan/chess-arena/go-backend/internal/models"
)

// Claims represents JWT claims for user authentication
type Claims struct {
	UserID   int      `json:"userId"`
	Username string   `json:"username"`
	Roles    []string `json:"roles"`
	jwt.RegisteredClaims
}

// JWTService provides JWT token generation and validation
type JWTService struct {
	secretKey     string
	tokenDuration time.Duration
}

// NewJWTService creates a new JWT service
func NewJWTService(cfg *config.Config) (*JWTService, error) {
	if cfg.JWT.Secret == "" {
		return nil, errors.New("JWT secret is required")
	}

	duration, err := time.ParseDuration(cfg.JWT.Expiration)
	if err != nil {
		return nil, fmt.Errorf("invalid JWT expiration duration: %w", err)
	}

	return &JWTService{
		secretKey:     cfg.JWT.Secret,
		tokenDuration: duration,
	}, nil
}

// GenerateToken generates a JWT token for a user
func (j *JWTService) GenerateToken(user *models.User) (string, error) {
	expirationTime := time.Now().Add(j.tokenDuration)
	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Roles:    user.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(j.secretKey))
	if err != nil {
		return "", fmt.Errorf("error signing token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func (j *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(j.secretKey), nil
	})

	if err != nil {
		return nil, fmt.Errorf("error parsing token: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// HasRole checks if a user has a specific role
func HasRole(roles []string, role string) bool {
	for _, r := range roles {
		if r == role {
			return true
		}
	}
	return false
} 