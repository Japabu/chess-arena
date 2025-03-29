# Docker Deployment for Chess Arena

This document outlines how to deploy the Chess Arena application using Docker.

## Prerequisites

- Docker
- Docker Compose

## Deployment Steps

1. Clone the repository
2. Build and start the application:

```bash
docker-compose up -d
```

This will:
- Build the application (frontend and backend)
- Start the application on port 3000
- Start a PostgreSQL database on port 5432
- Run the backend which also serves the frontend

## Configuration

The following environment variables can be configured in the docker-compose.yml file:

### Chess Arena Service

#### Build Arguments
- `VITE_API_URL`: The URL of the backend API (default: http://localhost:3000/api)
  This is used during the build process to configure the frontend.

#### Runtime Environment Variables
- `PORT`: The port the application will run on (default: 3000)
- `FRONTEND_URL`: The URL of the frontend (default: http://localhost:3000)
- `DATABASE_URL`: The database connection string (default: postgresql://postgres:postgres@postgres:5432/chess_arena)

### PostgreSQL Service
- `POSTGRES_USER`: Database username (default: postgres)
- `POSTGRES_PASSWORD`: Database password (default: postgres)
- `POSTGRES_DB`: Database name (default: chess_arena)

## Changing the API URL

If you need to change the backend API URL:

1. Update the `VITE_API_URL` build argument in docker-compose.yml
2. Rebuild the application with:
```bash
docker-compose up -d --build
```

## Persistence

The PostgreSQL data is persisted in a Docker volume named `postgres-data`.

## API Structure

The application is structured with the following endpoints:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api
- WebSocket: http://localhost:3000/api/socket.io

## Database Connection

The PostgreSQL database is accessible at:
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: chess_arena 