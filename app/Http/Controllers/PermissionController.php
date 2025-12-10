<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permissions;

class PermissionController extends Controller
{
    public function index() {
        $permissions = Permission::where('is_deleted', false)->get([
            'permission_id',
            'permission_name',
        ]);

        return response()->json([
            'message' => 'Daftar permission',
            'data' => $permissions
        ]);
    }
}
