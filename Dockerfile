# Multi-stage Dockerfile for Next.js with SQLite & File Uploads

# Stage 1: Base & Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install native dependencies required for better-sqlite3 compilation
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build Application
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create user and required persistent directories
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/data /app/public/uploads && \
    chown -R nextjs:nodejs /app/data /app/public/uploads

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/data ./data

# Ensure proper permissions on persistent directories
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Declare persistent volumes for SQLite db and media uploads
VOLUME ["/app/data", "/app/public/uploads"]

CMD ["npm", "start", "--", "-p", "3000"]
