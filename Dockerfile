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

# Cache views only (config/route cache will use runtime env vars)
RUN php artisan view:cache

# Create storage link and set permissions
RUN php artisan storage:link 2>/dev/null || true \
    && chmod -R 775 /app/storage /app/bootstrap/cache /app/database

EXPOSE 8000

# At runtime: inject env vars into .env, clear cache, then serve
CMD set -e; \
    # Write Render env vars into .env so Laravel picks them up
    [ -n "$MAIL_MAILER" ] && sed -i "s|^MAIL_MAILER=.*|MAIL_MAILER=$MAIL_MAILER|" .env; \
    [ -n "$MAIL_HOST" ] && sed -i "s|^MAIL_HOST=.*|MAIL_HOST=$MAIL_HOST|" .env; \
    [ -n "$MAIL_PORT" ] && sed -i "s|^MAIL_PORT=.*|MAIL_PORT=$MAIL_PORT|" .env; \
    [ -n "$MAIL_USERNAME" ] && sed -i "s|^MAIL_USERNAME=.*|MAIL_USERNAME=$MAIL_USERNAME|" .env; \
    [ -n "$MAIL_PASSWORD" ] && sed -i "s|^MAIL_PASSWORD=.*|MAIL_PASSWORD=$MAIL_PASSWORD|" .env; \
    [ -n "$MAIL_ENCRYPTION" ] && sed -i "s|^MAIL_ENCRYPTION=.*|MAIL_ENCRYPTION=$MAIL_ENCRYPTION|" .env || sed -i "s|^MAIL_SCHEME=.*|MAIL_ENCRYPTION=$MAIL_ENCRYPTION|" .env; \
    [ -n "$MAIL_FROM_ADDRESS" ] && sed -i "s|^MAIL_FROM_ADDRESS=.*|MAIL_FROM_ADDRESS=$MAIL_FROM_ADDRESS|" .env; \
    [ -n "$MAIL_FROM_NAME" ] && sed -i "s|^MAIL_FROM_NAME=.*|MAIL_FROM_NAME=\"$MAIL_FROM_NAME\"|" .env; \
    php artisan config:clear && \
    php artisan route:clear && \
    php artisan migrate --force 2>/dev/null; \
    php artisan serve --host=0.0.0.0 --port=8000
