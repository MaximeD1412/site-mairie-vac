# Stage 1 — Dépendances
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2 — Development (hot reload via volume)
FROM node:24-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
CMD ["npm", "run", "dev"]

# Stage 3 — Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 4 — Runtime
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "-c", "node_modules/.bin/payload migrate && node_modules/.bin/next start"]
