# Stage 1: Build React + Vite production bundle
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src

RUN npm run build

# Stage 2: Single Ubuntu 24.04 container (Nginx port 80 + internal Snapshot JSON API localhost:3001)
FROM ubuntu:24.04 AS runner

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx curl ca-certificates libstdc++6 \
  && rm -rf /var/lib/apt/lists/* \
  && rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf \
  && ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log

# Salin runtime binary Node.js 22 dari stage builder (tanpa node_modules di runtime)
COPY --from=builder /usr/local/bin/node /usr/local/bin/node

# Salin hasil build frontend & konfigurasi Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Salin server API snapshot JSON, seed, dan entrypoint
COPY server.mjs /app/server.mjs
COPY data/snapshot.seed.json /app/seed/snapshot.seed.json
COPY data /app/data
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:80/api/health || exit 1

CMD ["/usr/local/bin/docker-entrypoint.sh"]
