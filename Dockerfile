# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate routes and build
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Copy the compiled binary
COPY --from=builder /app/dist/server ./server

# Copy static assets if any (favicon, etc.)
COPY --from=builder /app/favicon.ico ./favicon.ico

# Expose port (Bun.serve defaults to 3000)
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Run the server
CMD ["./server"]
