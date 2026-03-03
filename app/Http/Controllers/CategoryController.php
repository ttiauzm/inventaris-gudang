<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Categories;
use App\Models\Logs;

class CategoryController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_category')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk melihat kategori',
                'data'    => null
            ], 403);
        }

        $categories = Categories::where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori berhasil diambil',
            'data'    => $categories
        ], 200);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_category')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk melihat kategori',
                'data'    => null
            ], 403);
        }

        $category = Categories::find($id);

        if (!$category || $category->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan',
                'data'    => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kategori ditemukan',
            'data'    => $category
        ], 200);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        if (!$authUser->can('add_category')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menambah kategori',
                'data'    => null
            ], 403);
        }

        $request->validate([
            'category_name' => 'required|string|max:255',
            'description'   => 'nullable|string',
        ]);

        $category = Categories::create([
            'category_id'   => Str::uuid(),
            'category_name' => $request->category_name,
            'description'   => $request->description,
            'is_deleted'    => 0,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'categories',
            'row_id'     => $category->category_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan',
            'data'    => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('edit_category')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengedit kategori',
                'data'    => null
            ], 403);
        }

        $category = Categories::find($id);
        if (!$category || $category->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $request->validate([
            'category_name' => 'required|string|max:255',
            'description'   => 'nullable|string',
        ]);

        $category->update([
            'category_name' => $request->category_name,
            'description'   => $request->description,
            'updated_at'    => now(),
        ]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'UPDATE',
            'table_name' => 'categories',
            'row_id'     => $category->category_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui',
            'data'    => $category
        ], 200);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('delete_category')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk menghapus kategori',
                'data'    => null
            ], 403);
        }

        $category = Categories::find($id);
        if (!$category || $category->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $category->update([
            'is_deleted' => 1,
            'updated_at' => now(),
        ]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'DELETE',
            'table_name' => 'categories',
            'row_id'     => $category->category_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus (soft delete)',
            'data'    => null
        ], 200);
    }

    public function dropdownData()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_category')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk melihat dropdown kategori',
                'data'    => null
            ], 403);
        }

        $categories = Categories::where('is_deleted', 0)
            ->orderBy('category_name', 'asc')
            ->get(['category_id', 'category_name']);

        return response()->json([
            'success' => true,
            'message' => 'Dropdown data kategori berhasil diambil',
            'data'    => $categories
        ], 200);
    }
}