# ── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy manifests and prisma schema first (needed for `prisma generate`)
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client then build Next.js
RUN npx prisma generate && npm run build

# ── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static     ./.next/static
COPY --from=build /app/public           ./public

# Copy prisma schema + generated client so the runtime can connect to Postgres
COPY --from=build /app/prisma                      ./prisma
COPY --from=build /app/node_modules/.prisma        ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma        ./node_modules/@prisma

EXPOSE 3000

# DATABASE_URL and other secrets are injected at runtime via docker-compose / env vars
CMD ["node", "server.js"]
