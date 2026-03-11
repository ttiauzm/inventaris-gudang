<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permissions;
use Illuminate\Support\Facades\Auth;

class PermissionController extends Controller
{
    public function index() {
        $authUser = Auth::user();

        // ✅ HANYA Superadmin yang boleh lihat daftar permission sistem
        // Pastikan 'add_permission' atau 'view_permission' ada di $superOnly pada Seeder kamu
        if (!$authUser->hasPermission('add_permission')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengakses daftar permission.',
                'data'    => null
            ], 403);
        }

        // Mengambil permission yang aktif
        $permissions = Permissions::where('is_deleted', false)->get([
            'permission_id',
            'permission_name',
            'role_id', // Tambahkan role_id biar jelas ini permission milik siapa
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Daftar permission berhasil diambil',
            'data'    => $permissions
        ], 200);
    }
}