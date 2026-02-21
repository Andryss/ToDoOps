# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY public ./public
COPY src ./src
COPY tsconfig.json ./
ENV REACT_APP_API_URL=/api/v1
RUN npm run build

# Stage 2: serve
FROM nginx:1.28.2-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY conf/default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
