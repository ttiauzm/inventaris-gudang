<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permissions;

class PermissionController extends Controller
{
    public function index() {
        // Mengambil permission yang aktif
        $permissions = Permissions::where('is_deleted', false)->get([
            'permission_id',
            'permission_name',
        ]);

        // ✅ Standar Sukses: success true, message, dan data
        return response()->json([
            'success' => true,
            'message' => 'Daftar permission berhasil diambil',
            'data'    => $permissions
        ], 200);
    }
}