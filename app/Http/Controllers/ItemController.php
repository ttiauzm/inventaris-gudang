<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Items;
use App\Models\Categories;
use App\Models\Materials;
use App\Models\Suppliers;
use App\Models\Logs;
use App\Models\Transactions;
use App\Models\Images;

class ItemController extends Controller
{
    public function index()
    {
        $items = Items::with(['categories', 'materials', 'suppliers', 'images'])
            ->where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar barang berhasil diambil',
            'data'    => $items
        ], 200);
    }

    public function show($id)
    {
        $item = Items::with(['categories', 'materials', 'suppliers', 'images'])->find($id);

        if (!$item || $item->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Barang tidak ditemukan',
                'data'    => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail barang ditemukan',
            'data'    => $item
        ], 200);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        if (!$authUser->can('add_item')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin menambah barang',
                'data'    => null
            ], 403);
        }

        $request->validate([
            'item_name' => 'required|string|max:100',
            'category_id' => 'required|exists:categories,category_id',
            'material_id' => 'required|exists:materials,material_id',
            'supplier_ids' => 'required|array',
            'supplier_ids.*' => 'exists:suppliers,supplier_id',
            'quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'price' => 'required|numeric|min:0',
            'images' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $item = Items::create([
            'item_id' => Str::uuid(),
            'item_name' => $request->item_name,
            'category_id' => $request->category_id,
            'material_id' => $request->material_id,
            'quantity' => $request->quantity,
            'unit' => $request->unit,
            'price' => $request->price,
            'is_deleted' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($request->hasFile('images')) {
            $file = $request->file('images');
            $path = $file->store('items', 'public');

            Images::create([
                'image_id' => Str::uuid(),
                'item_id' => $item->item_id,
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'file_type' => $file->getClientMimeType(),
            ]);
        }

        $item->suppliers()->attach($request->supplier_ids);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'items',
            'row_id'     => $item->item_id,
        ]);

        $itemWithImage = Items::with(['images', 'suppliers'])->find($item->item_id);

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil ditambahkan dengan relasi supplier',
            'data'    => $itemWithImage
        ], 201);
    }

    public function update(Request $request, $id)
    {

        $authUser = Auth::user();

        $parentItem = Items::find($id);
        if (!$parentItem || $parentItem->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Barang tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $request->validate([
            'quantity' => 'required|integer|min:0',
            'supplier_ids' => 'array',
            'supplier_ids.*' => 'exists:suppliers,supplier_id',
            'description' => 'nullable|string|max:255',
        ]);

        $originalQty = $parentItem->quantity;
        $newQty = $request->quantity;

        if ($newQty > $originalQty) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah melebihi stok yang tersedia',
                'data'    => null
            ], 400);
        }

        $supplierId = $request->supplier_ids[0] ?? $parentItem->suppliers()->first()?->supplier_id;

        if (!$supplierId) {
            return response()->json([
                'success' => false,
                'message' => 'Barang ini belum memiliki supplier',
                'data'    => null
            ], 400);
        }

        $parentItem->update([
            'quantity' => $originalQty - $newQty,
            'updated_at' => now(),
        ]);

        $childItem = Items::create([
            'item_id' => Str::uuid(),
            'parent_item_id' => $parentItem->item_id,
            'item_name' => $parentItem->item_name,
            'category_id' => $parentItem->category_id,
            'material_id' => $parentItem->material_id,
            'quantity' => $newQty,
            'unit' => $parentItem->unit,
            'price' => $parentItem->price,
            'is_deleted' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $parentImages = Images::where('item_id', $parentItem->item_id)->get();

        if ($parentImages->count() > 0) {
            foreach ($parentImages as $img) {
                Images::create([
                    'image_id'   => Str::uuid(),
                    'item_id'    => $childItem->item_id,
                    'file_path'  => $img->file_path,
                    'file_size'  => $img->file_size,
                    'file_type'  => $img->file_type,
                ]);
            }
        }

        $supplierIds = $request->supplier_ids ?? $parentItem->suppliers->pluck('supplier_id');
        $childItem->suppliers()->attach($supplierIds);

        // Logging & Transaction
        Logs::create([
            'log_id' => Str::uuid(), 'user_id' => $authUser->user_id, 'action' => 'UPDATE', 'table_name' => 'items', 'row_id' => $parentItem->item_id,
        ]);
        Logs::create([
            'log_id' => Str::uuid(), 'user_id' => $authUser->user_id, 'action' => 'CREATE', 'table_name' => 'items', 'row_id' => $childItem->item_id,
        ]);

        Transactions::create([
            'item_id' => $childItem->item_id,
            'user_id' => $authUser->user_id,
            'supplier_id' => $supplierId,
            'transaction_type' => 'CUT',
            'quantity' => $newQty,
            'unit' => $parentItem->unit,
            'description' => $request->description ?? 'Pengambilan barang dari stok utama',
            'transaction_date' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil diupdate dan item turunan dibuat',
            'data'    => [
                'parent_updated' => $parentItem->load(['suppliers', 'images']),
                'child_created'  => $childItem->load(['suppliers', 'images']),
            ]
        ], 200);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('delete_item')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin menghapus barang',
                'data'    => null
            ], 403);
        }

        $item = Items::find($id);
        if (!$item || $item->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Barang tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $item->update(['is_deleted' => 1, 'updated_at' => now()]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'DELETE',
            'table_name' => 'items',
            'row_id'     => $item->item_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil dihapus (soft delete)',
            'data'    => null
        ], 200);
    }

    public function dropdownData()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_item')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin mengakses data dropdown',
                'data'    => null
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data dropdown berhasil diambil',
            'data'    => [
                'categories' => Categories::where('is_deleted', 0)->orderBy('created_at', 'desc')->get(),
                'materials'  => Materials::where('is_deleted', 0)->orderBy('created_at', 'desc')->get(),
                'suppliers'  => Suppliers::where('is_deleted', 0)->orderBy('created_at', 'desc')->get()
            ]
        ], 200);
    }

    public function updateDetails(Request $request, $id)
    {
        $authUser = Auth::user();

        if ($authUser->role->role_name !== 'superadmin') { 
            return response()->json([
                'success' => false,
                'message' => 'Hanya Superadmin yang diizinkan mengedit detail barang',
                'data'    => null
            ], 403);
        }

        $item = Items::find($id);
        if (!$item || $item->is_deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Barang tidak ditemukan',
                'data'    => null
            ], 404);
        }

        // Validasi data (pakai 'sometimes' agar FE bisa kirim data yang mau diubah aja)
        $request->validate([
            'item_name'   => 'sometimes|string|max:100',
            'price'       => 'sometimes|numeric|min:0',
            'unit'        => 'sometimes|string|max:50',
        ]);

        // Proses update (hanya update kolom yang dikirim FE)
        $item->update($request->only([
            'item_name', 'category_id', 'material_id', 'price', 'unit'
        ]));
        $item->update(['updated_at' => now()]);

        // Catat di Logs
        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'UPDATE',
            'table_name' => 'items',
            'row_id'     => $item->item_id,
        ]);

        // Ambil data terbaru beserta relasinya untuk response
        $updatedItem = Items::with(['categories', 'materials', 'suppliers', 'images'])->find($item->item_id);

        return response()->json([
            'success' => true,
            'message' => 'Detail barang berhasil diperbarui',
            'data'    => $updatedItem
        ], 200);
    }
}
