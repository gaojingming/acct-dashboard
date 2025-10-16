FROM node:24-alpine3.21 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build will embed REACT_APP_API_URL into the static bundle when provided as a build-arg
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
# Copy a custom nginx config that listens on 8001 so the container serves on 8001
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8001