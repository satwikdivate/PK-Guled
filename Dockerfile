# syntax=docker/dockerfile:1

# ---------- Stage 1: build (image pipeline + prerender) ----------
# Node 24 ships npm 11, the same npm that wrote package-lock.json. With Node 22 (npm 10)
# `npm ci` rejects the lock file as out of sync (missing @emnapi/* optional packages).
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# sharp ships a prebuilt linuxmusl binary (@img/sharp-linuxmusl-x64), so no build tools are needed.
RUN npm ci --no-audit --no-fund

COPY . .
# prebuild: scripts/build-images.mjs (raw-images -> public/img + catalog JSON)
# build:    ng build (static prerender of every route)
# postbuild: scripts/build-sitemap.mjs (sitemaps, robots.txt, 404.html, csp.conf)
RUN npm run build

# ---------- Stage 2: serve (nginx, non-root, port 8080) ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/headers.conf /etc/nginx/snippets/headers.conf
COPY --from=build /app/dist/pkguled-web/csp.conf /etc/nginx/snippets/csp.conf
COPY --from=build /app/dist/pkguled-web/browser /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS -o /dev/null http://127.0.0.1:8080/ || wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
