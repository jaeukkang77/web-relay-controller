FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# ─── Build stage ─────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

RUN pnpm -F @repo/prisma-db prisma:generate
RUN pnpm -F @repo/prisma-db build
RUN pnpm -F @repo/api build

# ─── Runner stage ────────────────────────────────────────────
FROM node:22-alpine AS runner

# openssl is required by Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy the entire node_modules (preserves pnpm virtual store + symlinks)
COPY --from=builder /app/node_modules ./node_modules

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/prisma-db/dist ./packages/prisma-db/dist

# Copy prisma schema (needed for migrate deploy at runtime)
COPY packages/prisma-db/prisma ./packages/prisma-db/prisma

# Copy package.json files (needed for workspace module resolution)
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/prisma-db/package.json ./packages/prisma-db/

COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r//' ./entrypoint.sh && chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
