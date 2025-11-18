# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder
WORKDIR /workspace
COPY package.json package-lock.json nx.json tsconfig.base.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci
COPY apps ./apps
COPY services ./services
COPY packages ./packages
RUN npx nx build ai-orchestrator --configuration=production
WORKDIR /workspace/dist/services/ai-orchestrator
RUN npm install --package-lock-only
WORKDIR /workspace

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /workspace/dist/services/ai-orchestrator ./
RUN npm ci --omit=dev --ignore-scripts
EXPOSE 4002
CMD ["node", "main.js"]
