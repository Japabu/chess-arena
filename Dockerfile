# Stage 1: Build
FROM node:alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json for caching
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY backend/package.json backend/package-lock.json ./backend/

# Install dependencies
RUN npm install --prefix frontend && npm install --prefix backend

# Copy the rest of the application code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Set frontend build time environment variables
ENV VITE_API_URL=/api

# Build frontend and backend
RUN npm run build --prefix frontend && npm run build --prefix backend

# Stage 2: Production Image
FROM node:alpine

WORKDIR /app/backend

# Copy node_modules from the builder stage
COPY --from=builder /app/backend/node_modules ./node_modules/

# Copy built backend artifacts from the builder stage
COPY --from=builder /app/backend/dist ./

# Copy built frontend artifacts into the backend/public directory
COPY --from=builder /app/frontend/dist ./public

# Expose port
EXPOSE 3000

# Set backend runtime environment variables
ENV PORT=3000
ENV FRONTEND_URL=
ENV POSTGRES_URL=postgres://postgres:postgres@localhost:5432/chess_arena
ENV NODE_ENV=production
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=admin
ENV JWT_SECRET=stronger-jwt-secret-for-production
ENV LOG_LEVEL=debug

# Start the application
CMD ["node", "main.js"]