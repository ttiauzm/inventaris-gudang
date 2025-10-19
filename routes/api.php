<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/profile', function (Request $request) {
        return $request->user();
    });

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user_id}', [UserController::class, 'show']);
    Route::post('/users/create-admin', [UserController::class, 'createAdmin']);
    Route::patch('/users/self', [UserController::class, 'updateSelf']);
    Route::put('/users/{user_id}/update-profile', [UserController::class, 'updateProfile']);

    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::patch('/roles/{role_id}/permissions', [RoleController::class, 'togglePermission']);
    Route::delete('/users/{user_id}', [UserController::class, 'softDelete']);
});

