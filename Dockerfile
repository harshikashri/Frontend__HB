# Multi-stage Dockerfile for building the Vite React frontend and serving it with nginx

# Stage 1: build the app using Node
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package manifest first to leverage layer caching
COPY package.json package-lock.json* ./

# Install dependencies (fall back to npm install when no lockfile present)
RUN npm ci --silent || npm install --silent

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: serve the built assets with nginx
FROM nginx:alpine

# Remove default config and add SPA-friendly config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
