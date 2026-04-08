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

# Generate .env and APP_KEY at build time
RUN cp .env.example .env \
    && php artisan key:generate --force

# Save the APP_KEY for runtime
RUN grep APP_KEY .env > /tmp/app_key.txt

# Create SQLite for build-time migrations only
RUN mkdir -p /app/database \
    && touch /app/database/database.sqlite \
    && php artisan migrate --seed --force

# Cache views only
RUN php artisan view:cache

# Create storage link and set permissions
RUN php artisan storage:link 2>/dev/null || true \
    && chmod -R 775 /app/storage /app/bootstrap/cache /app/database

EXPOSE 8000

# At runtime: generate fresh .env from env vars, then serve
CMD APP_KEY=$(cat /tmp/app_key.txt | cut -d= -f2) && \
    echo "APP_NAME=${APP_NAME:-IMS}" > .env && \
    echo "APP_ENV=production" >> .env && \
    echo "APP_KEY=${APP_KEY}" >> .env && \
    echo "APP_DEBUG=false" >> .env && \
    echo "APP_URL=${APP_URL:-http://localhost}" >> .env && \
    echo "DB_CONNECTION=pgsql" >> .env && \
    echo "DB_URL=${DATABASE_URL:-}" >> .env && \
    echo "SESSION_DRIVER=cookie" >> .env && \
    echo "SESSION_LIFETIME=120" >> .env && \
    echo "CACHE_STORE=file" >> .env && \
    echo "MAIL_MAILER=${MAIL_MAILER:-log}" >> .env && \
    echo "MAIL_HOST=${MAIL_HOST:-smtp.gmail.com}" >> .env && \
    echo "MAIL_PORT=${MAIL_PORT:-587}" >> .env && \
    echo "MAIL_USERNAME=${MAIL_USERNAME:-}" >> .env && \
    echo "MAIL_PASSWORD=${MAIL_PASSWORD:-}" >> .env && \
    echo "MAIL_ENCRYPTION=${MAIL_ENCRYPTION:-tls}" >> .env && \
    echo "MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-noreply@example.com}" >> .env && \
    echo "MAIL_FROM_NAME=${MAIL_FROM_NAME:-IMS}" >> .env && \
    php artisan config:clear && \
    php artisan route:clear && \
    php artisan migrate --seed --force 2>/dev/null; \
    php artisan serve --host=0.0.0.0 --port=8000
