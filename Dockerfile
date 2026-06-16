FROM php:8.2-fpm

# 1. Install komponen sistem Linux yang dibutuhkan library kamu
RUN apt-get update && apt-get install -y \
    zip \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    default-mysql-client

# 2. Konfigurasi dan Install ekstensi PHP (GD disetting khusus untuk Intervention Image)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql gd zip

# 3. Masukkan Composer ke dalam VPS
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www