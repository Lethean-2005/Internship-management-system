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

# Generate .env and APP_KEY at build time, save key for runtime
RUN cp .env.example .env \
    && php artisan key:generate --force \
    && grep -oP 'APP_KEY=\K.*' .env > /app/.app_key

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
CMD APP_KEY=$(cat /app/.app_key) && \
    printf 'APP_NAME="%s"\nAPP_ENV=production\nAPP_KEY=%s\nAPP_DEBUG=false\nAPP_URL=%s\nDB_CONNECTION=pgsql\nDB_URL=%s\nSESSION_DRIVER=cookie\nSESSION_LIFETIME=120\nCACHE_STORE=file\nMAIL_MAILER=%s\nMAIL_HOST=%s\nMAIL_PORT=%s\nMAIL_USERNAME=%s\nMAIL_PASSWORD=%s\nMAIL_ENCRYPTION=%s\nMAIL_FROM_ADDRESS=%s\nMAIL_FROM_NAME="%s"\n' \
    "${APP_NAME:-IMS}" "$APP_KEY" "${APP_URL:-http://localhost}" "${DATABASE_URL:-}" \
    "${MAIL_MAILER:-log}" "${MAIL_HOST:-smtp.gmail.com}" "${MAIL_PORT:-587}" \
    "${MAIL_USERNAME:-}" "${MAIL_PASSWORD:-}" "${MAIL_ENCRYPTION:-tls}" \
    "${MAIL_FROM_ADDRESS:-noreply@example.com}" "${MAIL_FROM_NAME:-IMS}" > .env && \
    php artisan config:clear && \
    php artisan route:clear && \
    php artisan migrate --seed --force 2>/dev/null; \
    php artisan serve --host=0.0.0.0 --port=8000
