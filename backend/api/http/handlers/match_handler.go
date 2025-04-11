package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/jan/chess-arena/go-backend/internal/middleware"
	"github.com/jan/chess-arena/go-backend/internal/models"
	"github.com/jan/chess-arena/go-backend/internal/services"
	"github.com/jan/chess-arena/go-backend/internal/websocket"
)

// MatchHandler handles HTTP requests related to matches
type MatchHandler struct {
	matchService *services.MatchService
	hub          *websocket.Hub
}

// NewMatchHandler creates a new match handler
func NewMatchHandler(matchService *services.MatchService, hub *websocket.Hub) *MatchHandler {
	return &MatchHandler{
		matchService: matchService,
		hub:          hub,
	}
}

// RegisterRoutes registers the match routes
func (h *MatchHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/matches/", h.handleMatchRequests)
	mux.HandleFunc("/api/matches", h.handleMatchesRequests)
}

// handleMatchRequests handles requests to /api/matches/:id
func (h *MatchHandler) handleMatchRequests(w http.ResponseWriter, r *http.Request) {
	// Extract match ID from path
	path := strings.TrimPrefix(r.URL.Path, "/api/matches/")
	segments := strings.Split(path, "/")
	idStr := segments[0]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid match ID", http.StatusBadRequest)
		return
	}

	// Check additional path segments for sub-resources
	if len(segments) > 1 && segments[1] != "" {
		switch segments[1] {
		case "move":
			h.makeMove(w, r, id)
			return
		case "start":
			h.startMatch(w, r, id)
			return
		case "abort":
			h.abortMatch(w, r, id)
			return
		}
	}

	switch r.Method {
	case http.MethodGet:
		h.getMatchByID(w, r, id)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleMatchesRequests handles requests to /api/matches
func (h *MatchHandler) handleMatchesRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.listMatches(w, r)
	case http.MethodPost:
		h.createMatch(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// getMatchByID handles GET /api/matches/:id
func (h *MatchHandler) getMatchByID(w http.ResponseWriter, r *http.Request, id int) {
	match, err := h.matchService.GetMatchByID(id)
	if err != nil {
		http.Error(w, "Match not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(match.ToResponse())
}

// listMatches handles GET /api/matches
func (h *MatchHandler) listMatches(w http.ResponseWriter, r *http.Request) {
	// Check if filtering by user ID
	userIDStr := r.URL.Query().Get("userId")
	if userIDStr != "" {
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}
		h.getUserMatches(w, r, userID)
		return
	}

	matches, err := h.matchService.ListMatches()
	if err != nil {
		http.Error(w, "Error fetching matches", http.StatusInternalServerError)
		return
	}

	// Convert to responses
	responses := make([]models.MatchResponse, len(matches))
	for i, match := range matches {
		responses[i] = match.ToResponse()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// getUserMatches handles GET /api/matches?userId=:id
func (h *MatchHandler) getUserMatches(w http.ResponseWriter, r *http.Request, userID int) {
	matches, err := h.matchService.GetUserMatches(userID)
	if err != nil {
		http.Error(w, "Error fetching user matches", http.StatusInternalServerError)
		return
	}

	// Convert to responses
	responses := make([]models.MatchResponse, len(matches))
	for i, match := range matches {
		responses[i] = match.ToResponse()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// createMatch handles POST /api/matches
func (h *MatchHandler) createMatch(w http.ResponseWriter, r *http.Request) {
	var input models.CreateMatchInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create match
	match, err := h.matchService.CreateMatch(&input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Notify users
	h.notifyMatchCreated(match)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(match.ToResponse())
}

// startMatch handles POST /api/matches/:id/start
func (h *MatchHandler) startMatch(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check authentication
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Start match
	match, err := h.matchService.StartMatch(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Check if user is a player in the match
	if match.WhiteID != claims.UserID && match.BlackID != claims.UserID {
		http.Error(w, "You are not a player in this match", http.StatusForbidden)
		return
	}

	// Notify users
	h.notifyMatchStarted(match)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(match.ToResponse())
}

// makeMove handles POST /api/matches/:id/move
func (h *MatchHandler) makeMove(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check authentication
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var input models.MakeMoveInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get the match
	match, err := h.matchService.GetMatchByID(id)
	if err != nil {
		http.Error(w, "Match not found", http.StatusNotFound)
		return
	}

	// Check if user is a player in the match
	if match.WhiteID != claims.UserID && match.BlackID != claims.UserID {
		http.Error(w, "You are not a player in this match", http.StatusForbidden)
		return
	}

	// Check if it's the user's turn
	moveCount := len(strings.Split(match.Moves, " "))
	if (moveCount%2 == 0 && match.WhiteID != claims.UserID) || (moveCount%2 == 1 && match.BlackID != claims.UserID) {
		http.Error(w, "It's not your turn", http.StatusForbidden)
		return
	}

	// Make move
	updatedMatch, err := h.matchService.MakeMove(id, &input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Notify users
	h.notifyMatchUpdated(updatedMatch)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedMatch.ToResponse())
}

// abortMatch handles POST /api/matches/:id/abort
func (h *MatchHandler) abortMatch(w http.ResponseWriter, r *http.Request, id int) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check authentication
	claims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get the match
	match, err := h.matchService.GetMatchByID(id)
	if err != nil {
		http.Error(w, "Match not found", http.StatusNotFound)
		return
	}

	// Check if user is a player in the match or an admin
	isAdmin := false
	for _, role := range claims.Roles {
		if role == "admin" {
			isAdmin = true
			break
		}
	}

	if match.WhiteID != claims.UserID && match.BlackID != claims.UserID && !isAdmin {
		http.Error(w, "You are not a player in this match", http.StatusForbidden)
		return
	}

	// Abort match
	if err := h.matchService.AbortMatch(id); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Notify users
	match.Status = models.MatchStatusAborted
	h.notifyMatchUpdated(match)

	w.WriteHeader(http.StatusNoContent)
}

// notifyMatchCreated notifies users about a new match
func (h *MatchHandler) notifyMatchCreated(match *models.Match) {
	// Notify white player
	whitePayload, _ := json.Marshal(match.ToResponse())
	whiteMessage := &websocket.Message{
		Type:    "match_created",
		Payload: whitePayload,
	}
	h.hub.BroadcastToUser(match.WhiteID, whiteMessage)

	// Notify black player
	blackPayload, _ := json.Marshal(match.ToResponse())
	blackMessage := &websocket.Message{
		Type:    "match_created",
		Payload: blackPayload,
	}
	h.hub.BroadcastToUser(match.BlackID, blackMessage)
}

// notifyMatchStarted notifies users that a match has started
func (h *MatchHandler) notifyMatchStarted(match *models.Match) {
	payload, _ := json.Marshal(match.ToResponse())
	message := &websocket.Message{
		Type:    "match_started",
		Payload: payload,
	}
	h.hub.BroadcastToMatch(match.ID, message)
}

// notifyMatchUpdated notifies users about match updates
func (h *MatchHandler) notifyMatchUpdated(match *models.Match) {
	payload, _ := json.Marshal(match.ToResponse())
	message := &websocket.Message{
		Type:    "match_updated",
		Payload: payload,
	}
	h.hub.BroadcastToMatch(match.ID, message)

	// If match is finished, send additional notification
	if match.Status != models.MatchStatusPending && match.Status != models.MatchStatusInProgress {
		finishMessage := &websocket.Message{
			Type:    fmt.Sprintf("match_%s", match.Status),
			Payload: payload,
		}
		h.hub.BroadcastToMatch(match.ID, finishMessage)
	}
} 