<?php

namespace App\Http\Controllers;

use App\Models\Items;
use App\Models\Suppliers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * 1. GET SUMMARY CARDS
     * Endpoint: GET /api/dashboard/cards
     */
    public function getCards(Request $request)
    {
        $totalBarang = Items::where('is_deleted', 0)->count();
        $totalSupplier = Suppliers::where('is_deleted', 0)->count();
        
        $skuAktif = Items::where('is_deleted', 0)
                        ->where('quantity', '>', 0) 
                        ->count(); 

        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;
        
        $supplierAktif = DB::table('transactions')
                    ->join('suppliers', 'transactions.supplier_id', '=', 'suppliers.supplier_id')
                    ->where('suppliers.is_deleted', 0)
                    ->whereMonth('transactions.created_at', $currentMonth)
                    ->whereYear('transactions.created_at', $currentYear)
                    ->distinct('transactions.supplier_id')
                    ->count('transactions.supplier_id');

        return response()->json([
            'success' => true,
            'data' => [
                'total_items' => $totalBarang,
                'total_suppliers' => $totalSupplier,
                'active_skus' => $skuAktif,
                'active_suppliers_this_month' => $supplierAktif,
            ]
        ], 200);
    }

    /**
     * 2. GET MOST ACTIVE ITEMS
     * Endpoint: GET /api/dashboard/most-active?sort=desc&category_id=xxx
     */
    public function getMostActive(Request $request)
    {
        $sortOrder = strtolower($request->query('sort', 'desc')); 
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        // Tangkap filter kategori dari URL (bisa null kalau FE gak ngirim)
        $categoryId = $request->query('category_id'); 

        $query = DB::table('transactions')
            ->join('items', 'transactions.item_id', '=', 'items.item_id')
            ->join('categories', 'items.category_id', '=', 'categories.category_id')
            ->select(
                'items.item_name', 
                'categories.category_name', // Biar FE tau ini kategori apa
                'items.unit', 
                DB::raw('SUM(transactions.quantity) as total_qty')
            )
            ->whereIn('transactions.transaction_type', ['OUT', 'CUT'])
            ->where('items.is_deleted', 0);

        // Kalau FE ngirim category_id, kita saring datanya!
        if ($categoryId) {
            $query->where('items.category_id', $categoryId);
        }

        $mostActiveItems = $query->groupBy('items.item_name', 'categories.category_name', 'items.unit') 
            ->orderBy('total_qty', $sortOrder)
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $mostActiveItems
        ], 200);
    }

    /**
     * 3. GET LEAST ACTIVE ITEMS
     * Endpoint: GET /api/dashboard/least-active?sort=asc&category_id=xxx
     */
    public function getLeastActive(Request $request)
    {
        $sortOrder = strtolower($request->query('sort', 'asc')); 
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $categoryId = $request->query('category_id'); 

        $query = DB::table('items')
            ->join('categories', 'items.category_id', '=', 'categories.category_id')
            ->leftJoin('transactions', function ($join) {
                $join->on('items.item_id', '=', 'transactions.item_id')
                     ->whereIn('transactions.transaction_type', ['OUT', 'CUT']);
            })
            ->select(
                'items.item_name', 
                'categories.category_name',
                'items.unit',
                DB::raw('COALESCE(SUM(transactions.quantity), 0) as total_qty')
            )
            ->where('items.is_deleted', 0);

        // Filter by category jika ada
        if ($categoryId) {
            $query->where('items.category_id', $categoryId);
        }

        $leastActiveItems = $query->groupBy('items.item_name', 'categories.category_name', 'items.unit')
            ->orderBy('total_qty', $sortOrder)
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $leastActiveItems
        ], 200);
    }

    /**
     * 4. GET HIGHEST VALUE ITEMS
     * Endpoint: GET /api/dashboard/highest-value?sort=desc&category_id=xxx
     */
    public function getHighestValue(Request $request)
    {
        $sortOrder = strtolower($request->query('sort', 'desc')); 
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $categoryId = $request->query('category_id'); 

        $query = DB::table('items')
            ->join('categories', 'items.category_id', '=', 'categories.category_id')
            ->select(
                'items.item_name', 
                'categories.category_name',
                'items.unit',
                DB::raw('SUM(items.quantity * items.price) as total_value')
            )
            ->where('items.is_deleted', 0) 
            ->where('items.quantity', '>', 0);

        // Filter by category jika ada
        if ($categoryId) {
            $query->where('items.category_id', $categoryId);
        }

        $highestValueItems = $query->groupBy('items.item_name', 'categories.category_name', 'items.unit')
            ->orderBy('total_value', $sortOrder)
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $highestValueItems
        ], 200);
    }
}