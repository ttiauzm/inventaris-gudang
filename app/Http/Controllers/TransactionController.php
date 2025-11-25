<?php

namespace App\Http\Controllers;

use App\Models\Transactions;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Carbon\Carbon;

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

    public function exportExcelTransactions()
    {
        $transactions = Transactions::with(['items', 'suppliers', 'users'])
            ->orderBy('created_at', 'desc')
            ->get();

        $rows = $transactions->map(function ($t) {
            return [
                'Transaction ID' => $t->transaction_id,
                'Item Name'      => $t->items->item_name ?? '-',
                'Supplier'       => $t->suppliers->supplier_name ?? '-',
                'User'           => $t->users->username ?? '-',
                'Type'           => $t->transaction_type,
                'Quantity'       => $t->quantity,
                'Unit'           => $t->unit,
                'Description'    => $t->description,
                'Created At'     => optional($t->created_at)->format('Y-m-d H:i:s'),
            ];
        })->toArray();

        $path = storage_path('app/transactions.xlsx');

        $writer = SimpleExcelWriter::create($path)
            ->addRows($rows);

        return response()->download($path)->deleteFileAfterSend();
    }

}
