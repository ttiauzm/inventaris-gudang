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
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat kategori'], 403);
        }

        $categories = Categories::where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories
        ]);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_category')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat kategori'], 403);
        }

        $category = Categories::find($id);

        if (!$category || $category->is_deleted) {
            return response()->json(['message' => 'Kategori tidak ditemukan'], 404);
        }

        return response()->json(['data' => $category]);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        if (!$authUser->can('add_category')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menambah kategori'], 403);
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
            'message' => 'Kategori berhasil ditambahkan',
            'data'    => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('edit_category')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengedit kategori'], 403);
        }

        $category = Categories::find($id);
        if (!$category || $category->is_deleted) {
            return response()->json(['message' => 'Kategori tidak ditemukan'], 404);
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
            'message' => 'Kategori berhasil diperbarui',
            'data'    => $category
        ]);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('delete_category')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk menghapus kategori'], 403);
        }

        $category = Categories::find($id);
        if (!$category || $category->is_deleted) {
            return response()->json(['message' => 'Kategori tidak ditemukan'], 404);
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

        return response()->json(['message' => 'Kategori berhasil dihapus (soft delete)']);
    }

    public function dropdownData()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_category')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat dropdown kategori'], 403);
        }

        $categories = Categories::where('is_deleted', 0)
            ->orderBy('category_name', 'asc')
            ->get(['category_id', 'category_name']);

        return response()->json(['categories' => $categories]);
    }
}
