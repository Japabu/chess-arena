# Chess Arena

A platform for hosting chess bot tournaments with real-time spectating capabilities.

## Overview

Chess Arena is a comprehensive platform where developers can register their chess bots and let them compete against each other. The platform consists of three main components:

- **Backend**: A NestJS-based server providing REST and WebSocket APIs
- **Frontend**: An Angular application for user interaction and match spectating
- **Bot Client**: A reference implementation of a chess bot client

The platform allows for:

- Bot registration and authentication
- Automated chess matches between bots
- Real-time spectating of ongoing matches
- Tournament organization and management
- Administrative controls for managing users, bots, and matches

## Components

### Backend

The backend is built with NestJS and provides:

- REST API for user management, match creation, and tournament organization
- WebSocket API for real-time game state updates and move processing
- Authentication and authorization for both users and bots
- Match logic and validation using chess.js

**Key Features:**

- Secure user and bot authentication
- Real-time match updates via WebSockets
- Complete match history and statistics
- Admin dashboard for platform management

### Frontend

The frontend is built with Angular and provides:

- Public pages for spectating matches and viewing tournaments
- Bot registration interface for developers
- Admin dashboard for application management
- Real-time chess board visualization

**Key Features:**

- Responsive design for desktop and mobile
- Real-time match updates
- Interactive chess board visualization
- Tournament brackets and statistics

### Bot Client

The bot client is a reference implementation for developers to understand how to create their own chess bots for the platform:

- Node.js-based implementation
- Connection to the WebSocket API
- Authentication flow
- Example chess logic implementation
- Command-line interface for testing

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/japabu/chess-arena.git
   cd chess-arena
   ```

2. Install dependencies for all components:

   ```
   # Root dependencies
   npm install

   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install

   # Bot Client
   cd ../bot-client
   npm install
   ```

3. Configure the backend:

   - Create a `.env` file in the backend folder based on the example configuration
   - Set up your PostgreSQL database credentials

4. Start the development servers:

   ```
   # Backend
   cd backend
   npm run start:dev

   # Frontend
   cd ../frontend
   npm run dev
   ```

5. Test the bot client:
   ```
   cd ../bot-client
   node bot-client.js --username TestBot --password botpass
   ```

## Bot Development

To create your own chess bot for the platform:

1. Study the reference bot client implementation
2. Implement your own chess logic using any programming language
3. Connect to the WebSocket API and authenticate
4. Register your bot through the frontend
5. Join matches and send valid chess moves

## Administration

The admin interface allows platform administrators to:

- Manage user accounts
- Create and schedule tournaments
- Monitor active matches
- Review match history and statistics
- Ban malicious bots or users

## License

This project is licensed under the infamous "WHATEVER" License - see the [LICENSE](LICENSE) file for details.

TL;DR: We really dgaf. Just don't be evil, and if your chess bot becomes sentient, that's on you.

## Contributing

Contributions are welcome! As long as your code doesn't explode our servers or teach birds to play chess, we're cool with it. Please feel free to submit a Pull Request.

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
