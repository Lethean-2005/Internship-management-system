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
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_sqlite pdo_pgsql bcmath \
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

# Create SQLite for build-time migrations only (production uses PostgreSQL)
RUN mkdir -p /app/database \
    && touch /app/database/database.sqlite \
    && php artisan migrate --seed --force

# Cache views only
RUN php artisan view:cache

# Create storage link and set permissions
RUN php artisan storage:link 2>/dev/null || true \
    && chmod -R 775 /app/storage /app/bootstrap/cache /app/database

EXPOSE 8000

# At runtime: write all env vars to .env, run migrations on PostgreSQL, then serve
CMD echo "" >> .env && \
    echo "DB_CONNECTION=pgsql" >> .env && \
    echo "DB_URL=${DATABASE_URL:-}" >> .env && \
    echo "MAIL_MAILER=${MAIL_MAILER:-log}" >> .env && \
    echo "MAIL_HOST=${MAIL_HOST:-127.0.0.1}" >> .env && \
    echo "MAIL_PORT=${MAIL_PORT:-587}" >> .env && \
    echo "MAIL_USERNAME=${MAIL_USERNAME:-}" >> .env && \
    echo "MAIL_PASSWORD=${MAIL_PASSWORD:-}" >> .env && \
    echo "MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-tls}" >> .env && \
    echo "MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-noreply@example.com}" >> .env && \
    echo "MAIL_FROM_NAME=\"${MAIL_FROM_NAME:-Laravel}\"" >> .env && \
    php artisan config:clear && \
    php artisan route:clear && \
    php artisan migrate --seed --force 2>/dev/null; \
    php artisan serve --host=0.0.0.0 --port=8000
