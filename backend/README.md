# Chess Arena Go Backend

This is the Go implementation of the Chess Arena backend service, following the migration from the original NestJS implementation.

## Prerequisites

- Go (1.16 or later)
- PostgreSQL (or your database of choice)

## Project Structure

```
go-backend/
├── api/
│   └── http/        # HTTP handlers
├── cmd/
│   └── server/      # Application entry point
├── configs/         # Configuration files
├── internal/
│   ├── config/      # Configuration management
│   ├── models/      # Domain models
│   ├── repository/  # Data access layer
│   └── services/    # Business logic
```

## Getting Started

1. Install Go: https://golang.org/doc/install

2. Clone the repository:
   ```bash
   git clone https://github.com/jan/chess-arena.git
   cd chess-arena/go-backend
   ```

3. Initialize the Go module (once Go is installed):
   ```bash
   go mod init github.com/jan/chess-arena/go-backend
   go mod tidy
   ```

4. Create a `.env` file based on the example:
   ```
   PORT=8080
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=chess-arena
   ```

5. Build and run the server:
   ```bash
   go build ./cmd/server
   ./server
   ```

## Development

### Adding Dependencies

```bash
go get <package-name>
```

### Running Tests

```bash
go test ./...
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user

## Database Setup

This project expects a PostgreSQL database. You'll need to:

1. Create a database
2. Run migrations (to be implemented)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request 