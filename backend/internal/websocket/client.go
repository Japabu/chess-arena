package websocket

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/jan/chess-arena/go-backend/internal/auth"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins
	CheckOrigin: func(r *http.Request) bool { return true },
}

// ServeWs handles WebSocket requests from clients
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, jwtService *auth.JWTService) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Extract user ID from token if present
	var userID int
	tokenString := r.URL.Query().Get("token")
	if tokenString != "" {
		claims, err := jwtService.ValidateToken(tokenString)
		if err == nil {
			userID = claims.UserID
		}
	}

	client := &Client{
		hub:      hub,
		userID:   userID,
		send:     make(chan []byte, 256),
	}
	
	// Set the unregister function
	client.unregister = func() {
		hub.unregister <- client
	}

	// Register the client
	hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines
	go client.writePump(conn)
	go client.readPump(conn)
}

// readPump pumps messages from the WebSocket connection to the hub
func (c *Client) readPump(conn *websocket.Conn) {
	defer func() {
		c.unregister()
		conn.Close()
	}()

	conn.SetReadLimit(maxMessageSize)
	conn.SetReadDeadline(time.Now().Add(pongWait))
	conn.SetPongHandler(func(string) error { conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))

		// Parse the message
		var clientMessage Message
		if err := json.Unmarshal(message, &clientMessage); err != nil {
			log.Printf("error unmarshaling message: %v", err)
			continue
		}

		// Handle subscribe to match
		if clientMessage.Type == "subscribe_match" {
			var payload struct {
				MatchID int `json:"matchId"`
			}
			if err := json.Unmarshal(clientMessage.Payload, &payload); err == nil && payload.MatchID > 0 {
				c.hub.SubscribeToMatch(c, payload.MatchID)
			}
		}
	}
}

// writePump pumps messages from the hub to the WebSocket connection
func (c *Client) writePump(conn *websocket.Conn) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel
				conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current websocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
} 