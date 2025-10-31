<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transactions;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_transaction')) {
            return response()->json(['message' => 'Anda tidak memiliki izin melihat transaksi'], 403);
        }

        $transactions = Transactions::with([
            'items:item_id,item_name',
            'suppliers:supplier_id,supplier_name',
            'users:user_id,username'
        ])
        ->select('transaction_id', 'item_id', 'supplier_id', 'user_id', 'transaction_type', 'quantity', 'unit', 'description', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'status' => 'success',
            'data' => $transactions
        ]);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_transaction')) {
            return response()->json(['message' => 'Anda tidak memiliki izin melihat transaksi'], 403);
        }

        $transaction = Transactions::with([
            'items:item_id,item_name',
            'suppliers:supplier_id,supplier_name',
            'users:user_id,username'
        ])
        ->select('transaction_id', 'item_id', 'supplier_id', 'user_id', 'transaction_type', 'quantity', 'unit', 'description', 'created_at')
        ->find($id);

        if (!$transaction) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transaction
        ]);
    }
}
