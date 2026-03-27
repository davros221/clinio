# ── Builder ──────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

# 1) Dependency layer (cached until lockfile changes)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

# 2) Source code
COPY nx.json tsconfig.base.json tsconfig.json ./
COPY packages/shared/ packages/shared/
COPY apps/server/ apps/server/

# 3) Build
RUN pnpm nx build server

# ── Runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

# Copy lockfile + workspace manifests for pruned install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/

ENV HUSKY=0
RUN pnpm install --frozen-lockfile --prod

# Copy built output
COPY --from=builder /app/apps/server/dist apps/server/dist

EXPOSE 8000

CMD ["node", "apps/server/dist/main.js"]
