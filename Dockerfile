FROM node:18-alpine as builder

WORKDIR /app

# Define build argument for API URL
ARG VITE_API_URL

# Set environment variable from build arg
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./

RUN npm ci

COPY . .

# Create a .env file with build-time values
RUN echo "VITE_API_URL=$VITE_API_URL" > .env

RUN echo "VITE_MEDIA_PATH=$VITE_MEDIA_PATH" > .env

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
