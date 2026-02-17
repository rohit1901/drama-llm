FROM node:lts-alpine

# Install PostgreSQL client for health checks
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies) for building
RUN npm install

# Copy TypeScript configs
COPY tsconfig.json ./
COPY tsconfig.prod.json ./

# Copy source files
COPY src ./src

# Build TypeScript with production config (relaxed type checking)
RUN npx tsc -p tsconfig.prod.json

# Remove devDependencies to reduce image size
RUN npm prune --production

# Create logs directory
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["npm", "start"]
