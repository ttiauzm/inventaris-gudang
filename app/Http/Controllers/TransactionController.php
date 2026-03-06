<?php

namespace App\Http\Controllers;

use App\Models\Transactions;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionController extends Controller
{
    public function index()
    {
        $authUser = Auth::user();

        // ✅ Opsional: Buka komentar ini jika ingin mengaktifkan permission
        // if (!$authUser->can('view_transaction')) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Anda tidak memiliki izin melihat transaksi',
        //         'data'    => null
        //     ], 403);
        // }

        $transactions = Transactions::with([
            'items:item_id,item_name',
            'suppliers:supplier_id,supplier_name',
            'users:user_id,username'
        ])
        ->select('transaction_id', 'item_id', 'supplier_id', 'user_id', 'transaction_type', 'quantity', 'unit', 'description', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar transaksi berhasil diambil',
            'data'    => $transactions
        ], 200);
    }

    public function show($id)
    {
        $authUser = Auth::user(); // ✅ Diperbaiki dari Auth::users()

        if (!$authUser->can('view_transaction')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin melihat transaksi',
                'data'    => null
            ], 403);
        }

        $transaction = Transactions::with([
            'items:item_id,item_name',
            'suppliers:supplier_id,supplier_name',
            'users:user_id,username'
        ])
        ->select('transaction_id', 'item_id', 'supplier_id', 'user_id', 'transaction_type', 'quantity', 'unit', 'description', 'created_at')
        ->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan',
                'data'    => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail transaksi ditemukan',
            'data'    => $transaction
        ], 200);
    }

    public function exportExcelTransactions()
    {
        $authUser = Auth::user();

        // ✅ Cek izin sebelum ekspor
        if (!$authUser->can('view_transaction')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengekspor transaksi',
                'data'    => null
            ], 403);
        }

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

        SimpleExcelWriter::create($path)->addRows($rows);

        // ✅ Untuk file download, kembalikan response download langsung
        return response()->download($path)->deleteFileAfterSend();
    }

    public function exportPDF()
    {
        $authUser = Auth::user();

        if (!$authUser->can('view_transaction')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengekspor transaksi',
                'data'    => null
            ], 403);
        }

        $transactions = Transactions::with(['items', 'suppliers', 'users'])
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.transactions', [
            'transactions' => $transactions,
            'generated_at' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('History_' . now()->format('Y-m-d') . '.pdf');
    }
}