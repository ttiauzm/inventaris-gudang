<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Materials;
use App\Models\Logs;
use Barryvdh\DomPDF\Facade\Pdf;

class MaterialController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('view_material')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk melihat material',
                'data'    => null
            ], 403);
        }

        $materials = Materials::where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar material berhasil diambil',
            'data'    => $materials
        ], 200);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('view_material')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk melihat material',
                'data'    => null
            ], 403);
        }

        $material = Materials::find($id);

        if (!$material || $material->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Material tidak ditemukan',
                'data'    => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail material ditemukan',
            'data'    => $material
        ], 200);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('add_material')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menambah material',
                'data'    => null
            ], 403);
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

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'materials',
            'row_id'     => $material->material_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Material berhasil ditambahkan',
            'data'    => $material
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('update_material')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengedit material',
                'data'    => null
            ], 403);
        }

        $material = Materials::find($id);
        if (!$material || $material->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Material tidak ditemukan',
                'data'    => null
            ], 404);
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

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'UPDATE',
            'table_name' => 'materials',
            'row_id'     => $material->material_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Material berhasil diperbarui',
            'data'    => $material
        ], 200);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('delete_material')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menghapus material',
                'data'    => null
            ], 403);
        }

        $material = Materials::find($id);
        if (!$material || $material->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Material tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $material->update([
            'is_deleted' => 1,
            'updated_at' => now(),
        ]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'DELETE',
            'table_name' => 'materials',
            'row_id'     => $material->material_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Material berhasil dihapus (soft delete)',
            'data'    => null
        ], 200);
    }

    public function dropdownData()
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('view_material')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk melihat dropdown material',
                'data'    => null
            ], 403);
        }

        $materials = Materials::where('is_deleted', 0)
            ->orderBy('material_name', 'asc')
            ->get(['material_id', 'material_name']);

        return response()->json([
            'success' => true,
            'message' => 'Dropdown data material berhasil diambil',
            'data'    => $materials
        ], 200);
    }

    public function exportPDF()
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('view_material')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengekspor material',
                'data'    => null
            ], 403);
        }

        $materials = Materials::where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.materials', [
            'materials'    => $materials,
            'generated_at' => now()->format('d/m/Y H:i'),
        ]);

        return $pdf->download('Material_' . now()->format('Y-m-d') . '.pdf');
    }
}