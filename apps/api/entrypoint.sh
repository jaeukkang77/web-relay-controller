#!/bin/sh
set -e

echo "[API] Running database migrations..."
/app/node_modules/.bin/prisma migrate deploy --schema=/app/packages/prisma-db/prisma/schema.prisma

echo "[API] Starting server..."
exec node /app/apps/api/dist/main.js
