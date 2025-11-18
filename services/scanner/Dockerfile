# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder
WORKDIR /workspace
COPY package.json package-lock.json nx.json tsconfig.base.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci
COPY apps ./apps
COPY services ./services
COPY packages ./packages
RUN npx nx build scanner --configuration=production
WORKDIR /workspace/dist/services/scanner
RUN npm install --package-lock-only
WORKDIR /workspace

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /workspace/dist/services/scanner ./
RUN npm ci --omit=dev --ignore-scripts
RUN npx playwright install-deps chromium
RUN npx playwright install chromium
EXPOSE 4001
CMD ["node", "main.js"]
