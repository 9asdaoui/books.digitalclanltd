# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ARG VITE_PAYPAL_CLIENT_ID=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve static assets
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
