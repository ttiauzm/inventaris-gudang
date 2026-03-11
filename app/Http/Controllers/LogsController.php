<?php

namespace App\Http\Controllers;

use App\Models\Logs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Barryvdh\DomPDF\Facade\Pdf;

class LogsController extends Controller
{
    /**
     * View Logs (GET /api/logs)
     */
    public function index()
    {
        $authUser = Auth::user();

        // ✅ GANTI can() -> hasPermission()
        if (!$authUser || !$authUser->hasPermission('view_logs')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk melihat log aktivitas sistem.',
                'data'    => null
            ], 403);
        }

        // Ambil logs + relasi user (hanya username)
        $logs = Logs::with(['user:user_id,username'])
            ->orderBy('created_at', 'desc')
            ->paginate(20); 

        return response()->json([
            'success' => true,
            'message' => 'Logs retrieved successfully',
            'data'    => $logs
        ], 200);
    }

    /**
     * Export Logs Excel (GET /api/export/logs)
     */
    public function exportExcelLogs()
    {
        $authUser = Auth::user();

        // ✅ GANTI can() -> hasPermission()
        if (!$authUser || !$authUser->hasPermission('view_logs')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengekspor log',
                'data'    => null
            ], 403);
        }

        $logs = Logs::with(['user:user_id,username'])
            ->orderBy('created_at', 'desc')
            ->get();

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

        $path = storage_path('app/logs.xlsx');

        SimpleExcelWriter::create($path)->addRows($rows);

        return response()->download($path)->deleteFileAfterSend();
    }

    /**
     * Export Logs PDF
     */
    public function exportPDF()
    {
        $authUser = Auth::user();

        // ✅ GANTI can() -> hasPermission()
        if (!$authUser || !$authUser->hasPermission('view_logs')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki izin untuk mengekspor log ke PDF',
                'data'    => null
            ], 403);
        }

        $logs = Logs::with(['user:user_id,username'])
            ->orderBy('created_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('exports.logs', [
            'logs'         => $logs,
            'generated_at' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('SystemLog_' . now()->format('Y-m-d') . '.pdf');
    }
}