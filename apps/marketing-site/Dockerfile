# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder
WORKDIR /workspace
COPY package*.json nx.json tsconfig.base.json .
COPY apps ./apps
COPY services ./services
COPY packages ./packages
COPY tools ./tools
RUN npm ci
RUN npx nx build marketing-site --configuration=production

FROM nginx:1.27-alpine
COPY apps/marketing-site/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist/apps/marketing-site/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
