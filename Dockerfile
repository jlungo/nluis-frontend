FROM node:18-alpine as builder

WORKDIR /app

# Define build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_API_AUTH_URL
ARG VITE_API_TIMEOUT

# Set environment variables from build args
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_API_AUTH_URL=$VITE_API_AUTH_URL \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Generate env-config.js with runtime variables
RUN cp /app/public/env-config.js.template /app/dist/env-config.js && \
    sed -i "s|VITE_API_BASE_URL|$VITE_API_BASE_URL|g" /app/dist/env-config.js && \
    sed -i "s|VITE_API_AUTH_URL|$VITE_API_AUTH_URL|g" /app/dist/env-config.js && \
    sed -i "s|VITE_API_TIMEOUT|$VITE_API_TIMEOUT|g" /app/dist/env-config.js

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
