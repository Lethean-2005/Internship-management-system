# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + serve frontend
FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    unzip \
    && docker-php-ext-install pdo pdo_sqlite bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY backend/ /app/

RUN composer install --no-interaction --no-progress --no-dev --optimize-autoloader

# Copy built frontend into Laravel public directory
COPY --from=frontend-build /app/frontend/dist/ /app/public/

# Generate .env from example and create APP_KEY
RUN cp .env.example .env \
    && php artisan key:generate --force

# Create SQLite database and run migrations
RUN mkdir -p /app/database \
    && touch /app/database/database.sqlite \
    && php artisan migrate --seed --force

# Cache config and routes for performance
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Create storage link and set permissions
RUN php artisan storage:link 2>/dev/null || true \
    && chmod -R 775 /app/storage /app/bootstrap/cache /app/database

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
