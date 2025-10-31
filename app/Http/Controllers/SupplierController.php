<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Suppliers;
use App\Models\Logs;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SupplierController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();
        if (!$authUser->can('management_supplier')) {
            return response()->json(['message' => 'Anda tidak memiliki izin mengelola supplier'], 403);
        }

        $suppliers = Suppliers::where('is_deleted', 0)->get();

        return response()->json([
            'status' => 'success',
            'data' => $suppliers
        ]);
    }

    public function store(Request $request)
    {

        $authUser = Auth::user();
        if (!$authUser->can('management_supplier')) {
            return response()->json(['message' => 'Anda tidak memiliki izin menambah supplier'], 403);
        }

        $validated = $request->validate([
            'supplier_name' => 'required|string|max:100',
            'contact_info' => 'nullable|string|max:50',
            'street' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:50',
            'province' => 'nullable|string|max:50',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:50',
        ]);

        $supplier = Suppliers::create([
            'supplier_id' => Str::uuid(),
            ...$validated
        ]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'CREATE',
            'table_name' => 'suppliers',
            'row_id'     => $supplier->supplier_id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil ditambahkan',
            'data' => $supplier
        ]);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();
        if (!$authUser->can('management_supplier')) {
            return response()->json(['message' => 'Anda tidak memiliki izin mengedit supplier'], 403);
        }

        $supplier = Suppliers::where('supplier_id', $id)->where('is_deleted', 0)->first();
        if (!$supplier) {
            return response()->json(['message' => 'Supplier tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'supplier_name' => 'required|string|max:100',
            'contact_info' => 'nullable|string|max:50',
            'street' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:50',
            'province' => 'nullable|string|max:50',
            'postal_code' => 'nullable|string|max:10',
            'country' => 'nullable|string|max:50',
        ]);

        $supplier->update($validated);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'UPDATE',
            'table_name' => 'suppliers',
            'row_id'     => $supplier->supplier_id,
        ]);


        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil diperbarui',
            'data' => $supplier
        ]);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();
        if (!$authUser->can('management_supplier')) {
            return response()->json(['message' => 'Anda tidak memiliki izin menghapus supplier'], 403);
        }

        $supplier = Suppliers::where('supplier_id', $id)->where('is_deleted', 0)->first();
        if (!$supplier) {
            return response()->json(['message' => 'Supplier tidak ditemukan'], 404);
        }

        $supplier->update(['is_deleted' => 1]);

        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $authUser->user_id,
            'action'     => 'DELETE',
            'table_name' => 'suppliers',
            'row_id'     => $supplier->supplier_id,
        ]);


        return response()->json([
            'status' => 'success',
            'message' => 'Supplier berhasil dihapus'
        ]);
    }

    private function createLog($userId, $action, $table, $rowId)
    {
        Logs::create([
            'log_id' => Str::uuid(),
            'user_id' => $userId,
            'action' => $action,
            'table_name' => $table,
            'row_id' => $rowId,
        ]);
    }
}
