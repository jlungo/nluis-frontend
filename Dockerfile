FROM node:18-alpine as builder

WORKDIR /app

# Define build arguments for environment variables
ARG VITE_API_URL
ARG VITE_TEST_API_URL
ARG VITE_DODOSO_DOC_TYPE_ID
ARG VITE_APP_PORT

# Set environment variables from build args
ENV VITE_API_URL=$VITE_API_URL \
    VITE_TEST_API_URL=$VITE_TEST_API_URL \
    VITE_DODOSO_DOC_TYPE_ID=$VITE_DODOSO_DOC_TYPE_ID \
    VITE_APP_PORT=$VITE_APP_PORT

COPY package*.json ./

RUN npm ci

COPY . .

# Create a .env file with build-time values
RUN echo "VITE_API_URL=$VITE_API_URL" > .env && \
    echo "VITE_TEST_API_URL=$VITE_TEST_API_URL" >> .env && \
    echo "VITE_DODOSO_DOC_TYPE_ID=$VITE_DODOSO_DOC_TYPE_ID" >> .env && \
    echo "VITE_APP_PORT=$VITE_APP_PORT" >> .env

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