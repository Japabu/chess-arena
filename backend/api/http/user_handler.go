package http

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/jan/chess-arena/go-backend/internal/models"
	"github.com/jan/chess-arena/go-backend/internal/services"
)

// UserHandler handles HTTP requests related to users
type UserHandler struct {
	userService *services.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// RegisterRoutes registers the user routes
func (h *UserHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/users/", h.handleUserRequests)
	mux.HandleFunc("/api/users", h.handleUsersRequests)
}

// handleUserRequests handles requests to /api/users/:id
func (h *UserHandler) handleUserRequests(w http.ResponseWriter, r *http.Request) {
	// Extract user ID from path
	path := strings.TrimPrefix(r.URL.Path, "/api/users/")
	userID := strings.Split(path, "/")[0]

	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getUserByID(w, r, userID)
	case http.MethodPut:
		// Update user (not implemented)
		http.Error(w, "Not implemented", http.StatusNotImplemented)
	case http.MethodDelete:
		// Delete user (not implemented)
		http.Error(w, "Not implemented", http.StatusNotImplemented)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleUsersRequests handles requests to /api/users
func (h *UserHandler) handleUsersRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// List users (not implemented)
		http.Error(w, "Not implemented", http.StatusNotImplemented)
	case http.MethodPost:
		h.createUser(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// getUserByID handles GET /api/users/:id
func (h *UserHandler) getUserByID(w http.ResponseWriter, r *http.Request, userID string) {
	user, err := h.userService.GetUserByID(userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	respondJSON(w, user)
}

// createUser handles POST /api/users
func (h *UserHandler) createUser(w http.ResponseWriter, r *http.Request) {
	var input models.CreateUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// In a real implementation, you would validate the input here

	user, err := h.userService.CreateUser(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	respondJSON(w, user)
}

// respondJSON sends a JSON response
func respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
	}
} 