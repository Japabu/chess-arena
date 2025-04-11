package middleware

import (
	"net/http"
	"strings"

	"github.com/jan/chess-arena/go-backend/internal/config"
)

// ApplyCORS applies CORS headers to the response
func ApplyCORS(cfg *config.Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			// Check if the origin is allowed
			allowed := false
			for _, allowedOrigin := range cfg.CORS.AllowedOrigins {
				if origin == allowedOrigin || allowedOrigin == "*" {
					allowed = true
					break
				}
			}

			if allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}
		}

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// ContentTypeJSON sets the Content-Type header to application/json
func ContentTypeJSON(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

// LoggingMiddleware logs HTTP requests
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Don't log health check requests to reduce noise
		if !strings.HasPrefix(r.URL.Path, "/health") {
			// Log the request
			remoteAddr := r.Header.Get("X-Forwarded-For")
			if remoteAddr == "" {
				remoteAddr = r.RemoteAddr
			}
		}
		next.ServeHTTP(w, r)
	})
} 