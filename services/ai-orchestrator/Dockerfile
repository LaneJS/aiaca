# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /workspace
COPY package*.json nx.json tsconfig.base.json .
COPY apps ./apps
COPY services ./services
COPY packages ./packages
COPY tools ./tools
RUN npm ci
RUN npx nx run ai-orchestrator:prune-lockfile --configuration=production

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /workspace/dist/services/ai-orchestrator ./
RUN npm ci --omit=dev
EXPOSE 4002
CMD ["node", "main.js"]
