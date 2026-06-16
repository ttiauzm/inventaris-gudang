<?php

return [
    // Tambahkan 'login' langsung ke paths berjaga-jaga jika URL-nya nyasar lagi
    'paths' => ['api/*', 'login', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    // Masukkan URL spesifik dari Vercel sesuai screenshot terakhirmu
    'allowed_origins' => ['https://app-delova.vercel.app'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];