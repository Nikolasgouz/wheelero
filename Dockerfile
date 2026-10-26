FROM oven/bun:1.4.2 AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
ARG PUBLIC_URL
ARG PUBLIC_INDEXING=false
ENV PUBLIC_URL=$PUBLIC_URL PUBLIC_INDEXING=$PUBLIC_INDEXING
RUN bun run build

FROM caddy:2
COPY --from=frontend /build/frontend/dist /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile
