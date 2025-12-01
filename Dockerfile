FROM node:20-alpine as builder

WORKDIR /app

# Define build arguments
ARG VITE_API_URL
ARG VITE_MAPBOX_TOKEN

# Set environment variables from build args
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN

COPY package*.json ./

RUN npm ci

COPY . .

# Create a .env file with build-time values
RUN echo "VITE_API_URL=$VITE_API_URL" > .env
RUN echo "VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN" >> .env
RUN echo "VITE_MEDIA_PATH=$VITE_MEDIA_PATH" >> .env

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
