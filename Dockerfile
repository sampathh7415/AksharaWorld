# Multi-stage Dockerfile for Akshara World Dashboards

# Build stage for main dashboard
FROM node:20-alpine AS dashboard-builder
WORKDIR /app/dashboard
COPY dashboard/package*.json ./
RUN npm ci
COPY dashboard/ .
RUN npm run build

# Build stage for akshara dashboard
FROM node:20-alpine AS akshara-builder
WORKDIR /app/akshara-world-dashboard
COPY akshara-world-dashboard/package*.json ./
RUN npm ci
COPY akshara-world-dashboard/ .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install both apps
COPY --from=dashboard-builder /app/dashboard/.next ./dashboard/.next
COPY --from=dashboard-builder /app/dashboard/node_modules ./dashboard/node_modules
COPY --from=dashboard-builder /app/dashboard/package*.json ./dashboard/

COPY --from=akshara-builder /app/akshara-world-dashboard/.next ./akshara-world-dashboard/.next
COPY --from=akshara-builder /app/akshara-world-dashboard/node_modules ./akshara-world-dashboard/node_modules
COPY --from=akshara-builder /app/akshara-world-dashboard/package*.json ./akshara-world-dashboard/

EXPOSE 3000 3001

# Start both services
CMD ["sh", "-c", "cd dashboard && npm start & cd ../akshara-world-dashboard && npm start"]
