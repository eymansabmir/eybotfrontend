# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Vite bakes these into the static bundle at build time (via import.meta.env / index.html %VITE_*%).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_BASE_MEDIA_URL
ENV VITE_BASE_MEDIA_URL=$VITE_BASE_MEDIA_URL

ARG VITE_ENABLE_VOICE_TECH
ENV VITE_ENABLE_VOICE_TECH=$VITE_ENABLE_VOICE_TECH

ARG VITE_ENABLE_USERS
ENV VITE_ENABLE_USERS=$VITE_ENABLE_USERS

ARG VITE_ENABLE_CAMPAIGNS
ENV VITE_ENABLE_CAMPAIGNS=$VITE_ENABLE_CAMPAIGNS

ARG VITE_DEFAULT_WHATSAPP_BSP
ENV VITE_DEFAULT_WHATSAPP_BSP=$VITE_DEFAULT_WHATSAPP_BSP

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY src ./src
COPY public ./public
COPY index.html ./
COPY tsconfig*.json ./
COPY components.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
RUN npm run build

# Production Stage
FROM nginxinc/nginx-unprivileged:alpine AS runner

# Copy static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Runtime host allowlist (set ALLOWED_HOSTS at deploy time, e.g. devwhatsappfe.epf6.in)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
