################################################################################
# Frontend Build Stage (glibc-based Node image)
# For ARMv7 support, consider using an ARM-specific image (e.g., arm32v7/node:20-slim)
################################################################################
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Install frontend dependencies reproducibly with npm ci
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy the source code and build the frontend
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

################################################################################
# Backend Build Stage (musl-friendly Node image)
################################################################################
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Install backend dependencies reproducibly with npm ci
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# Copy backend source and build the backend
COPY backend/ ./
RUN npm run build

################################################################################
# Production Stage
################################################################################
FROM node:alpine
WORKDIR /app/backend

# Copy backend build artifacts and production node_modules
COPY --from=backend-builder /app/backend/dist ./dist/
COPY --from=backend-builder /app/backend/node_modules ./node_modules/

# Copy frontend build output into the backend public directory
COPY --from=frontend-builder /app/frontend/dist ./public/

# Expose the application port
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000 \
    FRONTEND_URL="" \
    LOG_LEVEL=debug \
    POSTGRES_URL="postgres://postgres:postgres@localhost:5432/chess_arena" \
    NODE_ENV=production \
    ADMIN_USERNAME=admin \
    ADMIN_PASSWORD=admin \
    JWT_SECRET=your-jwt-secret

# Start the backend application
CMD ["node", "dist/main.js"]
