# Build stage
FROM golang:1.20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod ./
# Try to download dependencies, but don't fail if go.mod doesn't exist yet
RUN go mod download || true

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -o server ./cmd/server

# Run stage
FROM alpine:latest

# Add ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Set working directory
WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/server .

# Copy configs if any
COPY --from=builder /app/configs ./configs

# Expose the application port
EXPOSE 8080

# Command to run
CMD ["./server"]
