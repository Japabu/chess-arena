package handlers

import (
	"net/http"

	"github.com/jan/chess-arena/go-backend/internal/auth"
	"github.com/jan/chess-arena/go-backend/internal/websocket"
)

// WebSocketHandler handles WebSocket connections
type WebSocketHandler struct {
	hub        *websocket.Hub
	jwtService *auth.JWTService
}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler(hub *websocket.Hub, jwtService *auth.JWTService) *WebSocketHandler {
	return &WebSocketHandler{
		hub:        hub,
		jwtService: jwtService,
	}
}

// ServeWs handles WebSocket connection requests
func (h *WebSocketHandler) ServeWs(w http.ResponseWriter, r *http.Request) {
	websocket.ServeWs(h.hub, w, r, h.jwtService)
} 