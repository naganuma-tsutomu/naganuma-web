# 1行目を変更: node:18-alpine → node:20-alpine
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# sharpなどの依存関係のためにlibc6-compatが必要な場合があるため追加推奨
RUN apk add --no-cache libc6-compat
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=$NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

# Next.jsのビルド
RUN npm run build

FROM base AS runner
WORKDIR /app
# 警告修正: = を追加
ENV NODE_ENV=production
ENV HOMELAB_PROMETHEUS_URL=http://192.168.20.130:9090

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
# 警告修正: = を追加
ENV PORT=3000

CMD ["node", "server.js"]
