<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LogsController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/email/verify/{id}/{hash}', [UserController::class, 'verifyEmail'])->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/profile', function (Request $request) {
        return $request->user();
    });

    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{user_id}', [UserController::class, 'show']);
    Route::post('/users/create-admin', [UserController::class, 'createAdmin']);
    Route::put('/users/{user_id}/update-profile', [UserController::class, 'updateProfile']);

    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::patch('/roles/{role_id}/permissions', [RoleController::class, 'togglePermission']);
    Route::delete('/users/{user_id}', [UserController::class, 'softDelete']);

    Route::get('/items/dropdown-data', [ItemController::class, 'dropdownData']);
    Route::get('/items', [ItemController::class, 'index']);
    Route::get('/items/{id}', [ItemController::class, 'show']);
    Route::post('/items', [ItemController::class, 'store']);
    Route::put('/items/{id}', [ItemController::class, 'update']);
    Route::put('/items/{id}/details', [ItemController::class, 'updateDetails']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::get('/export/transactions', [TransactionController::class, 'exportExcelTransactions']);
    Route::get('/export/transactions/pdf', [TransactionController::class, 'exportPDF']);

    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/suppliers', [SupplierController::class, 'store']);
    Route::put('/suppliers/{id}', [SupplierController::class, 'update']);
    Route::delete('/suppliers/{id}', [SupplierController::class, 'destroy']);

    Route::get('/materials/dropdown-data', [MaterialController::class, 'dropdownData']);
    Route::get('/materials', [MaterialController::class, 'index']);
    Route::get('/materials/{id}', [MaterialController::class, 'show']);
    Route::post('/materials', [MaterialController::class, 'store']);
    Route::put('/materials/{id}', [MaterialController::class, 'update']);
    Route::delete('/materials/{id}', [MaterialController::class, 'destroy']);

    Route::get('/categories/dropdown-data', [CategoryController::class, 'dropdownData']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::get('/logs', [LogsController::class, 'index']);
    Route::get('/export/logs', [LogsController::class, 'exportExcelLogs']);
    Route::get('/export/logs/pdf', [LogsController::class, 'exportPDF']);

    Route::get('/export/categories/pdf', [CategoryController::class, 'exportPDF']);
    Route::get('/export/materials/pdf', [MaterialController::class, 'exportPDF']);
    Route::get('/export/master-data/pdf', [CategoryController::class, 'exportMasterDataPDF']);
    Route::get('/export/items/pdf', [ItemController::class, 'exportPDF']);
});

