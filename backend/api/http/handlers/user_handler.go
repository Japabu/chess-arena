package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/jan/chess-arena/go-backend/internal/middleware"
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
	idStr := strings.Split(path, "/")[0]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.getUserByID(w, r, id)
	case http.MethodDelete:
		h.deleteUser(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleUsersRequests handles requests to /api/users
func (h *UserHandler) handleUsersRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listUsers(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// getUserByID handles GET /api/users/:id
func (h *UserHandler) getUserByID(w http.ResponseWriter, r *http.Request, id int) {
	user, err := h.userService.GetUserByID(id)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user.ToResponse())
}

// listUsers handles GET /api/users
func (h *UserHandler) listUsers(w http.ResponseWriter, r *http.Request) {
	// Check if user is an admin
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || !strings.Contains(strings.Join(claims.Roles, ","), "admin") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	users, err := h.userService.ListUsers()
	if err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}

	// Convert to responses
	responses := make([]interface{}, len(users))
	for i, user := range users {
		responses[i] = user.ToResponse()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// deleteUser handles DELETE /api/users/:id
func (h *UserHandler) deleteUser(w http.ResponseWriter, r *http.Request, id int) {
	// Check if user is an admin
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok || !strings.Contains(strings.Join(claims.Roles, ","), "admin") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if err := h.userService.DeleteUser(id); err != nil {
		http.Error(w, "Error deleting user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
} 