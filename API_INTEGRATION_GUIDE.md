# 🔌 API Integration Guide

## Current Status: Frontend-Only Mode (No Backend Required)

Aplikasi saat ini berjalan dalam **development mode** tanpa backend API. Semua authentication disimpan di **localStorage**.

---

## Option 1: Tetap Tanpa Backend (Current Setup) ✅

### Cara Login Tanpa API

1. **Via Login Form** (`dev@example.com` / `1234`)
2. **Via Test Page**: http://localhost:5174/test-login.html
3. **Via Browser Console** (lihat [TESTING_GUIDE.md](TESTING_GUIDE.md))

### Kelebihan:
- ✅ Tidak perlu setup backend Laravel
- ✅ Tidak perlu database
- ✅ Cepat untuk testing UI/UX
- ✅ Cocok untuk development frontend

### Kekurangan:
- ❌ Data tidak persisten (hilang jika clear localStorage)
- ❌ Tidak ada real authentication
- ❌ Tidak bisa test API integration

---

## Option 2: Integrasi dengan Laravel Backend

Jika Anda punya folder **BE-client** (Laravel backend), ikuti langkah berikut:

### 1. Setup Laravel Backend

```bash
# Masuk ke folder backend
cd C:\xampp\htdocs\SIM-Fashion-Industry\react\BE-client

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Setup database di .env
DB_DATABASE=sim_fashion
DB_USERNAME=root
DB_PASSWORD=

# Migrate database
php artisan migrate --seed

# Jalankan server
php artisan serve
# Server akan running di http://localhost:8000
```

### 2. Buat API Endpoints di Laravel

Buat file `routes/api.php`:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User management (SuperAdmin only)
    Route::middleware('role:superadmin')->group(function () {
        Route::apiResource('users', UserController::class);
    });
});
```

### 3. Buat AuthController

`app/Http/Controllers/AuthController.php`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
```

### 4. Update User Model

Tambahkan role ke `app/Models/User.php`:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // 'SuperAdmin' or 'Admin'
        'roles', // JSON array [999] or [1]
    ];

    protected $casts = [
        'roles' => 'array',
    ];

    protected $appends = [
        'fullname',
        'first_name',
        'last_name'
    ];

    public function getFullnameAttribute()
    {
        return $this->name;
    }

    public function getFirstNameAttribute()
    {
        $parts = explode(' ', $this->name);
        return $parts[0] ?? '';
    }

    public function getLastNameAttribute()
    {
        $parts = explode(' ', $this->name);
        return count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '';
    }
}
```

### 5. Database Migration

`database/migrations/xxxx_add_role_to_users_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('Admin'); // SuperAdmin or Admin
            $table->json('roles')->nullable(); // [999] or [1]
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'roles']);
        });
    }
};
```

### 6. Seeder untuk Test User

`database/seeders/UserSeeder.php`:

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // SuperAdmin
        User::create([
            'name' => 'Super Admin',
            'email' => 'dev@example.com',
            'password' => Hash::make('1234'),
            'role' => 'SuperAdmin',
            'roles' => [999],
        ]);

        // Regular Admin
        User::create([
            'name' => 'Regular Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('1234'),
            'role' => 'Admin',
            'roles' => [1],
        ]);
    }
}
```

### 7. Enable API di Frontend

Update `src/app/modules/auth/components/Login.tsx`:

```typescript
// Uncomment baris ini untuk enable API login:
const response = await API.post("/login", {
  email: values.email,
  password: values.password,
})

const token = response.data.token
saveAuth({ token })
API.defaults.headers.common["Authorization"] = `Bearer ${token}`

const profile = await API.get("/profile")
setCurrentUser(profile.data)
```

Update `src/app/modules/auth/core/AuthInit.tsx`:

```typescript
// Uncomment baris ini untuk fetch user dari API:
try {
  const response = await API.get('/profile')
  setCurrentUser(response.data)
} catch (error) {
  console.error('Failed to fetch user:', error)
  logout()
}
```

### 8. Test API Connection

```bash
# Test API backend running
curl http://localhost:8000/api/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"1234"}'

# Response harus berisi token dan user data
```

---

## Environment Variables

File `.env` di frontend (sudah configured):

```env
VITE_API_URL=http://localhost:8000/api
```

File `.env` di backend:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5174

DB_DATABASE=sim_fashion
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5174
SESSION_DOMAIN=localhost
```

---

## CORS Setup (Laravel)

`config/cors.php`:

```php
return [
    'paths' => ['api/*'],
    'allowed_origins' => ['http://localhost:5174'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

---

## Kesimpulan

### Untuk Development (Sekarang):
✅ **Gunakan Frontend-Only Mode** (tanpa backend)
- Login via `dev@example.com` / `1234`
- Atau gunakan http://localhost:5174/test-login.html

### Untuk Production (Nanti):
✅ **Setup Laravel Backend** (ikuti langkah di atas)
- Real authentication
- Database integration
- API endpoints
- Role-based middleware

---

## Troubleshooting

### Masalah: Redirect terus ke login
**Solusi:** Clear localStorage dan login ulang
```javascript
localStorage.clear()
window.location.href = '/auth/login'
```

### Masalah: 401 Unauthorized dari API
**Solusi:** Check token dan CORS settings
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log
```

### Masalah: CORS errors
**Solusi:** Pastikan `config/cors.php` sudah benar dan jalankan:
```bash
php artisan config:clear
php artisan cache:clear
```
