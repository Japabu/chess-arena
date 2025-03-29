FROM node:20-alpine as build

# Add build argument with default value
ARG VITE_API_URL=http://localhost:3000/api

WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm run install:all

# Copy source code
COPY . .

# Set the API URL as environment variable during build
ENV VITE_API_URL=${VITE_API_URL}

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built apps
COPY --from=build /app/frontend/dist /app/frontend/dist
COPY --from=build /app/backend/dist /app/backend/dist
COPY --from=build /app/backend/node_modules /app/backend/node_modules
COPY --from=build /app/package*.json /app/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV FRONTEND_URL=http://localhost:3000

# Expose port
EXPOSE 3000

# Command to run backend (which will also serve frontend)
WORKDIR /app/backend
CMD ["node", "dist/main"] 