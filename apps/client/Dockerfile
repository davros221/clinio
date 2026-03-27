# ── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

# Build-time variable — Vite inlines it during build
ARG VITE_API_URL=http://localhost:8000

# 1) Dependency layer (cached until lockfile changes)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/client/package.json apps/client/
COPY packages/shared/package.json packages/shared/
COPY packages/api/package.json packages/api/

RUN pnpm install --frozen-lockfile

# 2) Source code
COPY nx.json tsconfig.base.json tsconfig.json ./
COPY packages/shared/ packages/shared/
COPY packages/api/ packages/api/
COPY apps/client/ apps/client/

# 3) Build
RUN VITE_API_URL=${VITE_API_URL} pnpm nx build client

# ── Runner ───────────────────────────────────────────────
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
