# 🔧 Backend Configuration Guide (Laravel BE-client)

## File-file yang Perlu Dikonfigurasi di Backend

### 1. CORS Configuration

**File: `config/cors.php`**

```php
<?php

return [
    /*
     * Paths yang diizinkan CORS
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
     * HTTP methods yang diizinkan
     */
    'allowed_methods' => ['*'], // GET, POST, PUT, DELETE, OPTIONS, dll

    /*
     * Origin yang diizinkan untuk akses API
     * Tambahkan URL frontend Anda
     */
    'allowed_origins' => [
        'http://localhost:3011',  // Frontend Vite dev server
        'http://localhost:3000',  // Alternative port
        'http://127.0.0.1:3011',
        // Tambahkan production URL nanti
        // 'https://yourfrontend.com',
    ],

    'allowed_origins_patterns' => [],

    /*
     * Headers yang diizinkan
     */
    'allowed_headers' => ['*'],

    /*
     * Headers yang di-expose ke frontend
     */
    'exposed_headers' => [],

    'max_age' => 0,

    /*
     * Support credentials (cookies, authorization headers)
     */
    'supports_credentials' => true,
];
```

---

### 2. Environment Configuration

**File: `.env`**

```env
APP_NAME="Fashion Industry System"
APP_ENV=local
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Frontend URL
FRONTEND_URL=http://localhost:3011

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fashion_industry
DB_USERNAME=root
DB_PASSWORD=

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3011,127.0.0.1:3011,localhost:3000
SESSION_DOMAIN=localhost

# Session & Cookie
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Cache
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

---

### 3. Sanctum Configuration (untuk API Authentication)

**File: `config/sanctum.php`**

```php
<?php

use Laravel\Sanctum\Sanctum;

return [
    /*
     * Stateful domains - domain yang bisa akses API dengan session
     */
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3011,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort()
    ))),

    /*
     * Guard untuk API authentication
     */
    'guard' => ['web'],

    /*
     * Expiration time untuk token (in minutes)
     * null = tidak pernah expire
     */
    'expiration' => null,

    /*
     * Middleware untuk authenticate requests
     */
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
        'validate_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    ],
];
```

---

### 4. API Routes Structure

**File: `routes/api.php`**

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\HistoryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is running',
        'timestamp' => now()
    ]);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Inventory Management
    Route::apiResource('inventory', InventoryController::class);
    Route::post('/inventory/{id}/adjust-stock', [InventoryController::class, 'adjustStock']);
    
    // Supplier Management
    Route::apiResource('suppliers', SupplierController::class);
    
    // Category Management
    Route::apiResource('categories', CategoryController::class);
    
    // Material Management
    Route::apiResource('materials', MaterialController::class);
    
    // History/Transaction Log
    Route::get('/history', [HistoryController::class, 'index']);
    Route::get('/history/{id}', [HistoryController::class, 'show']);
    Route::get('/history/export', [HistoryController::class, 'export']);
    
    // User Management (Super Admin only)
    Route::middleware('role:superadmin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('/users/{id}/assign-role', [UserController::class, 'assignRole']);
        Route::get('/logs', [LogController::class, 'index']);
    });
});
```

---

### 5. Middleware Configuration

**File: `app/Http/Kernel.php`**

```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * Global HTTP middleware
     */
    protected $middleware = [
        // \App\Http\Middleware\TrustHosts::class,
        \App\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class, // PENTING: CORS middleware
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * Route middleware groups
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * Route middleware
     */
    protected $middlewareAliases = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
        'precognitive' => \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
        'signed' => \App\Http\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
        'role' => \App\Http\Middleware\CheckRole::class, // Custom middleware untuk role check
    ];
}
```

---

### 6. Sample Controller: AuthController

**File: `app/Http/Controllers/Api/AuthController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
                    ->orWhere('email', $request->username)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'fullname' => $user->first_name . ' ' . $user->last_name,
                    'roles' => $user->roles->pluck('id')->toArray(),
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'fullname' => $user->first_name . ' ' . $user->last_name,
                'roles' => $user->roles->pluck('id')->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            ],
        ]);
    }
}
```

---

### 7. Database Migration: Users Table

**File: `database/migrations/xxxx_xx_xx_create_users_table.php`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

---

### 8. Database Seeder

**File: `database/seeders/DatabaseSeeder.php`**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        User::create([
            'username' => 'superadmin',
            'email' => 'superadmin@fashion.com',
            'password' => Hash::make('password123'),
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'is_active' => true,
        ])->assignRole('superadmin');

        // Create Regular Admin
        User::create([
            'username' => 'admin',
            'email' => 'admin@fashion.com',
            'password' => Hash::make('password123'),
            'first_name' => 'Regular',
            'last_name' => 'Admin',
            'is_active' => true,
        ])->assignRole('admin');

        // Create Staff
        User::create([
            'username' => 'staff',
            'email' => 'staff@fashion.com',
            'password' => Hash::make('password123'),
            'first_name' => 'Staff',
            'last_name' => 'User',
            'is_active' => true,
        ])->assignRole('staff');
    }
}
```

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd path/to/BE-client

# Install PHP dependencies
composer install

# Install Laravel Sanctum (jika belum)
composer require laravel/sanctum

# Install CORS package
composer require fruitcake/laravel-cors
```

### Step 2: Configure Environment

```bash
# Copy .env file
cp .env.example .env

# Generate app key
php artisan key:generate

# Edit .env sesuai konfigurasi di atas
```

### Step 3: Setup Database

```bash
# Create database 'fashion_industry' di MySQL/phpMyAdmin

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed

# Optional: Publish Sanctum migrations
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Step 4: Start Server

```bash
php artisan serve

# Backend akan berjalan di http://localhost:8000
# API endpoint: http://localhost:8000/api
```

---

## 🧪 Test Backend API

### Test Health Check

```bash
curl http://localhost:8000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2025-12-18 12:00:00"
}
```

### Test Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "superadmin",
      "email": "superadmin@fashion.com",
      "first_name": "Super",
      "last_name": "Admin",
      "fullname": "Super Admin",
      "roles": [999],
      "permissions": ["*"]
    },
    "token": "1|xxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

---

## ⚠️ Common Issues

### Issue: CORS Error

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
1. Pastikan `config/cors.php` sudah dikonfigurasi
2. Pastikan `HandleCors` middleware aktif di `app/Http/Kernel.php`
3. Clear cache: `php artisan config:clear`

### Issue: Token Mismatch

**Error:**
```
CSRF token mismatch
```

**Solution:**
1. Check `SANCTUM_STATEFUL_DOMAINS` di `.env`
2. Pastikan include port: `localhost:3011`
3. Restart backend server

### Issue: Unauthorized (401)

**Solution:**
1. Pastikan token dikirim di header: `Authorization: Bearer <token>`
2. Check token valid dan belum expire
3. Pastikan route dalam `auth:sanctum` middleware

---

## 📝 Credentials untuk Testing

```
Super Admin:
- Username: superadmin
- Password: password123

Regular Admin:
- Username: admin  
- Password: password123

Staff:
- Username: staff
- Password: password123
```

---

**Last Updated:** 18 Desember 2025
