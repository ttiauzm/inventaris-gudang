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

class ItemController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        $items = Items::with(['categories', 'materials', 'suppliers'])
            ->where('is_deleted', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $items
        ]);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        $item = Items::with(['categories', 'materials', 'suppliers'])->find($id);

        if (!$item || $item->is_deleted) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        return response()->json(['data' => $item]);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();

        if (!$authUser->can('add_item')) {
            return response()->json(['message' => 'Anda tidak memiliki izin menambah barang'], 403);
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

        $item->suppliers()->attach($request->supplier_ids);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'items',
            'row_id'     => $item->item_id,
        ]);

        return response()->json([
            'message' => 'Barang berhasil ditambahkan dengan relasi supplier',
            'data' => $item->load('suppliers')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();

        $parentItem = Items::find($id);
        if (!$parentItem || $parentItem->is_deleted) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        $request->validate([
            'quantity' => 'required|integer|min:0',
            'supplier_ids' => 'array',
            'supplier_ids.*' => 'exists:suppliers,supplier_id',
        ]);

        $originalQty = $parentItem->quantity;
        $newQty = $request->quantity;

        if ($newQty > $originalQty) {
            return response()->json(['message' => 'Jumlah melebihi stok yang tersedia'], 400);
        }

        $supplierId = $request->supplier_ids[0] ?? $parentItem->suppliers()->first()?->supplier_id;

        if (!$supplierId) {
            return response()->json(['message' => 'Barang ini belum memiliki supplier'], 400);
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

        $supplierIds = $request->supplier_ids ?? $parentItem->suppliers->pluck('supplier_id');
        $childItem->suppliers()->attach($supplierIds);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'UPDATE',
            'table_name' => 'items',
            'row_id'     => $parentItem->item_id,
        ]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'items',
            'row_id'     => $childItem->item_id,
        ]);

        Transactions::create([
            'item_id' => $childItem->item_id,
            'user_id' => $authUser->user_id,
            'supplier_id' => $supplierId,
            'transaction_type' => 'CUT',
            'quantity' => $newQty,
            'unit' => $parentItem->unit,
            'description' => 'Pengambilan barang dari stok utama',
            'transaction_date' => now(),
        ]);

        return response()->json([
            'message' => 'Barang berhasil diupdate dan item turunan dibuat',
            'parent_updated' => $parentItem->load('suppliers'),
            'child_created' => $childItem->load('suppliers'),
        ]);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('delete_item')) {
            return response()->json(['message' => 'Anda tidak memiliki izin menghapus barang'], 403);
        }

        $item = Items::find($id);
        if (!$item || $item->is_deleted) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        $item->update(['is_deleted' => 1, 'updated_at' => now()]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'DELETE',
            'table_name' => 'items',
            'row_id'     => $item->item_id,
        ]);

        return response()->json(['message' => 'Barang berhasil dihapus (soft delete)']);
    }

    public function dropdownData()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_item')) {
            return response()->json(['message' => 'Anda tidak memiliki izin mengakses data dropdown'], 403);
        }

        $categories = Categories::where('is_deleted', 0)->orderBy('created_at', 'desc')->get();
        $materials = Materials::where('is_deleted', 0)->orderBy('created_at', 'desc')->get();
        $suppliers = Suppliers::where('is_deleted', 0)->orderBy('created_at', 'desc')->get();

        return response()->json([
            'categories' => $categories,
            'materials' => $materials,
            'suppliers' => $suppliers
        ]);
    }
}
