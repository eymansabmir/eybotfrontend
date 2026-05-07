# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

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

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine AS runner

# Copy static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
