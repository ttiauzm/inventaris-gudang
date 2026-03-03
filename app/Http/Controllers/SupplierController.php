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
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin mengelola supplier',
                'data'    => null
            ], 403);
        }

        $suppliers = Suppliers::where('is_deleted', 0)->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar supplier berhasil diambil',
            'data'    => $suppliers
        ], 200);
    }

    public function store(Request $request)
    {
        $authUser = Auth::user();
        if (!$authUser->can('management_supplier')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin menambah supplier',
                'data'    => null
            ], 403);
        }

        $validated = $request->validate([
            'supplier_name' => 'required|string|max:100',
            'contact_info'  => 'nullable|string|max:50',
            'street'        => 'nullable|string|max:100',
            'city'          => 'nullable|string|max:50',
            'province'      => 'nullable|string|max:50',
            'postal_code'   => 'nullable|string|max:10',
            'country'       => 'nullable|string|max:50',
        ]);

        $supplier = Suppliers::create([
            'supplier_id' => Str::uuid(),
            ...$validated
        ]);

        $this->createLog($authUser->user_id, 'CREATE', 'suppliers', $supplier->supplier_id);

        return response()->json([
            'success' => true,
            'message' => 'Supplier berhasil ditambahkan',
            'data'    => $supplier
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $authUser = Auth::user();
        if (!$authUser->can('management_supplier')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin mengedit supplier',
                'data'    => null
            ], 403);
        }

        $supplier = Suppliers::where('supplier_id', $id)->where('is_deleted', 0)->first();
        if (!$supplier) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $validated = $request->validate([
            'supplier_name' => 'required|string|max:100',
            'contact_info'  => 'nullable|string|max:50',
            'street'        => 'nullable|string|max:100',
            'city'          => 'nullable|string|max:50',
            'province'      => 'nullable|string|max:50',
            'postal_code'   => 'nullable|string|max:10',
            'country'       => 'nullable|string|max:50',
        ]);

        $supplier->update($validated);

        $this->createLog($authUser->user_id, 'UPDATE', 'suppliers', $supplier->supplier_id);

        return response()->json([
            'success' => true,
            'message' => 'Supplier berhasil diperbarui',
            'data'    => $supplier
        ], 200);
    }

    public function destroy($id)
    {
        $authUser = Auth::user();
        if (!$authUser->can('management_supplier')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin menghapus supplier',
                'data'    => null
            ], 403);
        }

        $supplier = Suppliers::where('supplier_id', $id)->where('is_deleted', 0)->first();
        if (!$supplier) {
            return response()->json([
                'success' => false,
                'message' => 'Supplier tidak ditemukan',
                'data'    => null
            ], 404);
        }

        $supplier->update(['is_deleted' => 1]);

        $this->createLog($authUser->user_id, 'DELETE', 'suppliers', $supplier->supplier_id);

        return response()->json([
            'success' => true,
            'message' => 'Supplier berhasil dihapus',
            'data'    => null
        ], 200);
    }

    private function createLog($userId, $action, $table, $rowId)
    {
        Logs::create([
            'log_id'     => Str::uuid(),
            'user_id'    => $userId,
            'action'     => $action,
            'table_name' => $table,
            'row_id'     => $rowId,
        ]);
    }
}