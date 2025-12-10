<?php

namespace App\Http\Controllers;

use App\Models\Logs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\SimpleExcel\SimpleExcelWriter;

class LogsController extends Controller
{
    /**
     * View Logs (GET /api/logs)
     */
    public function index()
    {
        $authUser = Auth::user();

        // Cek izin
        if (!$authUser || !$authUser->can('view_logs')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk melihat log'], 403);
        }

        // Ambil logs + relasi user (hanya username)
        $logs = Logs::with(['user:user_id,username'])
            ->orderBy('created_at', 'desc')
            ->paginate(20); // paginator biar bagus

        return response()->json([
            'message' => 'Logs retrieved successfully',
            'data' => $logs
        ]);
    }

    /**
     * Export Logs Excel (GET /api/export/logs)
     */
    public function exportExcelLogs()
    {
        $authUser = Auth::user();

        // Cek izin
        if (!$authUser || !$authUser->can('view_logs')) {
            return response()->json(['message' => 'Anda tidak memiliki izin untuk mengekspor log'], 403);
        }

        // Ambil logs + relasi user (hanya username)
        $logs = Logs::with(['user:user_id,username'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Format baris untuk Excel
        $rows = $logs->map(function ($log) {
            return [
                'Log ID'     => $log->log_id,
                'User'       => $log->user->username ?? '-',
                'Action'     => $log->action,
                'Table'      => $log->table_name,
                'Row ID'     => $log->row_id ?? '-',
                'Timestamp'  => optional($log->created_at)->format('Y-m-d H:i:s'),
            ];
        })->toArray();

        // Path penyimpanan sementara
        $path = storage_path('app/logs.xlsx');

        // Generate file Excel
        $writer = SimpleExcelWriter::create($path)
            ->addRows($rows);

        // Download + Auto delete setelah send
        return response()->download($path)->deleteFileAfterSend();
    }

}
