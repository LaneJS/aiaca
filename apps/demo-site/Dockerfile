# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder
WORKDIR /workspace
COPY package*.json nx.json tsconfig.base.json .
COPY apps ./apps
COPY services ./services
COPY packages ./packages
RUN CYPRESS_INSTALL_BINARY=0 npm ci
RUN npx nx build demo-site --configuration=production

FROM nginx:1.27-alpine
COPY apps/demo-site/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/dist/apps/demo-site/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
