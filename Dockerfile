# Build stage
FROM node:lts AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:lts-alpine

WORKDIR /app

# Install wget for health check
RUN apk add --no-cache wget

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4173

# Expose application port
EXPOSE 4173

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4173 || exit 1

# Start the preview server
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
