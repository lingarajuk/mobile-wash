# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY shared ./shared
COPY apps/worker ./apps/worker

ARG VITE_API_URL=http://localhost:5000/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build:worker

# Production Serve Stage
FROM nginx:alpine

COPY --from=builder /app/dist/worker /usr/share/nginx/html
COPY apps/worker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5174

CMD ["nginx", "-g", "daemon off;"]
