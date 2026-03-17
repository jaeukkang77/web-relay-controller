FROM node:22-alpine AS web-builder
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm -F web build

# ─── nginx stage ─────────────────────────────────────────────
FROM nginx:alpine

COPY --from=web-builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
