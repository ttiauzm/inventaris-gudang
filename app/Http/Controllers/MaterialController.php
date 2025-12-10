<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Materials;
use App\Models\Logs;

class MaterialController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_material')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat material'], 403);
        }

        $materials = Materials::where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $materials
        ]);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_material')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat material'], 403);
        }

        $material = Materials::find($id);

        if (!$material || $material->is_deleted) {
            return response()->json(['message' => 'Material tidak ditemukan'], 404);
        }

        return response()->json(['data' => $material]);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        if (!$authUser->can('add_material')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menambah material'], 403);
        }

        $request->validate([
            'material_name' => 'required|string|max:255',
            'description'   => 'nullable|string',
        ]);

        $material = Materials::create([
            'material_id'   => Str::uuid(),
            'material_name' => $request->material_name,
            'description'   => $request->description,
            'is_deleted'    => 0,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // ✅ Rekam log CREATE
        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'materials',
            'row_id'     => $material->material_id,
        ]);

        return response()->json([
            'message' => 'Material berhasil ditambahkan',
            'data'    => $material
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('edit_material')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengedit material'], 403);
        }

        $material = Materials::find($id);
        if (!$material || $material->is_deleted) {
            return response()->json(['message' => 'Material tidak ditemukan'], 404);
        }

        $request->validate([
            'material_name' => 'required|string|max:255',
            'description'   => 'nullable|string',
        ]);

        $material->update([
            'material_name' => $request->material_name,
            'description'   => $request->description,
            'updated_at'    => now(),
        ]);

        // ✅ Rekam log UPDATE
        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'UPDATE',
            'table_name' => 'materials',
            'row_id'     => $material->material_id,
        ]);

        return response()->json([
            'message' => 'Material berhasil diperbarui',
            'data'    => $material
        ]);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('delete_material')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus material'], 403);
        }

        $material = Materials::find($id);
        if (!$material || $material->is_deleted) {
            return response()->json(['message' => 'Material tidak ditemukan'], 404);
        }

        $material->update([
            'is_deleted' => 1,
            'updated_at' => now(),
        ]);

        // ✅ Rekam log DELETE
        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'DELETE',
            'table_name' => 'materials',
            'row_id'     => $material->material_id,
        ]);

        return response()->json(['message' => 'Material berhasil dihapus (soft delete)']);
    }

    public function dropdownData()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_material')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat dropdown material'], 403);
        }

        $materials = Materials::where('is_deleted', 0)
            ->orderBy('material_name', 'asc')
            ->get(['material_id', 'material_name']);

        return response()->json(['materials' => $materials]);
    }
}
