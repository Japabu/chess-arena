FROM node:20-alpine as build

# Add build argument for API URL
ARG VITE_API_URL=http://localhost:3000/api

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set the API URL as environment variable during build
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# Production stage with lightweight web server
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 4000

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 