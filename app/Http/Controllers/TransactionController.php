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

        if (!$authUser->hasPermission('view_transaction')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin melihat riwayat transaksi',
                'data'    => null
            ], 403);
        }

        $transactions = Transactions::with([
            'item:item_id,item_name',
            'supplier:supplier_id,supplier_name',
            'user:user_id,username'
        ])
        ->select('transaction_id', 'item_id', 'supplier_id', 'user_id', 'transaction_type', 'quantity', 'unit', 'description', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

        $transactions->map(function ($transaction) {
            // Gandakan data tunggal menjadi properti jamak yang dicari frontend
            $transaction->items = $transaction->item;
            $transaction->users = $transaction->user;
            $transaction->suppliers = $transaction->supplier; // Jaga-jaga kalau FE butuh nama supplier
            
            return $transaction;
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar transaksi berhasil diambil',
            'data'    => $transactions
        ], 200);
    }

    public function show($id)
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('view_transaction')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin melihat detail transaksi',
                'data'    => null
            ], 403);
        }

        $transaction = Transactions::with([
            'item:item_id,item_name',
            'supplier:supplier_id,supplier_name',
            'user:user_id,username'
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

        if (!$authUser->hasPermission('view_transaction')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengekspor data transaksi',
                'data'    => null
            ], 403);
        }

        $transactions = Transactions::with(['item', 'supplier', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $rows = $transactions->map(function ($t) {
            return [
                'Transaction ID' => $t->transaction_id,
                // UBAH DI SINI: Panggil property objeknya tanpa huruf 's'
                'Item Name'      => $t->item->item_name ?? '-',
                'Supplier'       => $t->supplier->supplier_name ?? '-',
                'User'           => $t->user->username ?? '-',
                'Type'           => $t->transaction_type,
                'Quantity'       => $t->quantity,
                'Unit'           => $t->unit,
                'Description'    => $t->description,
                'Created At'     => optional($t->created_at)->format('Y-m-d H:i:s'),
            ];
        })->toArray();

        $path = storage_path('app/transactions.xlsx');

        SimpleExcelWriter::create($path)->addRows($rows);

        return response()->download($path)->deleteFileAfterSend();
    }

    public function exportPDF()
    {
        $authUser = Auth::user();

        if (!$authUser->hasPermission('view_transaction')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengekspor riwayat transaksi ke PDF',
                'data'    => null
            ], 403);
        }

        $transactions = Transactions::with(['item', 'supplier', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.transactions', [
            'transactions' => $transactions,
            'generated_at' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('History_' . now()->format('Y-m-d') . '.pdf');
    }
}