package websocket

import (
	"encoding/json"
	"sync"
)

// Message represents a message sent over WebSocket
type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// Client represents a WebSocket client
type Client struct {
	hub      *Hub
	userID   int
	send     chan []byte
	unregister func()
}

// Hub maintains the set of active clients and broadcasts messages to them
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// User ID to clients mapping
	userClients map[int][]*Client

	// Match ID to clients subscribed to that match
	matchSubscriptions map[int][]*Client

	// Messages to broadcast to registered clients
	broadcast chan *Message

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Mutex for protecting maps
	mu sync.RWMutex
}

// NewHub creates a new WebSocket hub
func NewHub() *Hub {
	return &Hub{
		broadcast:          make(chan *Message),
		register:           make(chan *Client),
		unregister:         make(chan *Client),
		clients:            make(map[*Client]bool),
		userClients:        make(map[int][]*Client),
		matchSubscriptions: make(map[int][]*Client),
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.registerClient(client)

		case client := <-h.unregister:
			h.unregisterClient(client)

		case message := <-h.broadcast:
			h.broadcastMessage(message)
		}
	}
}

// RegisterClient registers a client
func (h *Hub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[client] = true

	if client.userID > 0 {
		h.userClients[client.userID] = append(h.userClients[client.userID], client)
	}
}

// UnregisterClient unregisters a client
func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.send)

		if client.userID > 0 {
			clients := h.userClients[client.userID]
			for i, c := range clients {
				if c == client {
					h.userClients[client.userID] = append(clients[:i], clients[i+1:]...)
					break
				}
			}
			if len(h.userClients[client.userID]) == 0 {
				delete(h.userClients, client.userID)
			}
		}

		// Remove from match subscriptions
		for matchID, clients := range h.matchSubscriptions {
			for i, c := range clients {
				if c == client {
					h.matchSubscriptions[matchID] = append(clients[:i], clients[i+1:]...)
					break
				}
			}
			if len(h.matchSubscriptions[matchID]) == 0 {
				delete(h.matchSubscriptions, matchID)
			}
		}
	}
}

// BroadcastMessage broadcasts a message to clients
func (h *Hub) broadcastMessage(message *Message) {
	data, err := json.Marshal(message)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		select {
		case client.send <- data:
		default:
			go client.unregister()
		}
	}
}

// BroadcastToUser broadcasts a message to a specific user
func (h *Hub) BroadcastToUser(userID int, message *Message) {
	data, err := json.Marshal(message)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.userClients[userID] {
		select {
		case client.send <- data:
		default:
			go client.unregister()
		}
	}
}

// BroadcastToMatch broadcasts a message to everyone subscribed to a match
func (h *Hub) BroadcastToMatch(matchID int, message *Message) {
	data, err := json.Marshal(message)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.matchSubscriptions[matchID] {
		select {
		case client.send <- data:
		default:
			go client.unregister()
		}
	}
}

// SubscribeToMatch subscribes a client to match updates
func (h *Hub) SubscribeToMatch(client *Client, matchID int) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.matchSubscriptions[matchID] = append(h.matchSubscriptions[matchID], client)
} 