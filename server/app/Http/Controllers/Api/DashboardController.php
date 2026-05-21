<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $now = Carbon::now();
        $startThisMonth = $now->copy()->startOfMonth();
        $endThisMonth = $now->copy()->endOfMonth();
        $startLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endLastMonth = $now->copy()->subMonth()->endOfMonth();

        $salesStatuses = ['shipped', 'delivered'];

        $salesThisMonth = Order::where('is_deleted', false)
            ->whereIn('status', $salesStatuses)
            ->whereBetween('created_at', [$startThisMonth, $endThisMonth])
            ->sum('total_amount');

        $salesLastMonth = Order::where('is_deleted', false)
            ->whereIn('status', $salesStatuses)
            ->whereBetween('created_at', [$startLastMonth, $endLastMonth])
            ->sum('total_amount');

        $salesPriorMonth = Order::where('is_deleted', false)
            ->whereIn('status', $salesStatuses)
            ->whereBetween('created_at', [
                $now->copy()->subMonths(2)->startOfMonth(),
                $now->copy()->subMonths(2)->endOfMonth(),
            ])
            ->sum('total_amount');

        $percentChange = $salesLastMonth > 0
            ? round((($salesThisMonth - $salesLastMonth) / $salesLastMonth) * 100, 1)
            : ($salesThisMonth > 0 ? 100 : 0);

        return response()->json([
            'total_products' => Product::where('is_deleted', false)->count(),
            'pending_orders' => Order::where('is_deleted', false)->where('status', 'pending')->count(),
            'sales_this_month' => (float) $salesThisMonth,
            'sales_last_month' => (float) $salesLastMonth,
            'sales_percent_change' => $percentChange,
        ], 200);
    }

    public function activityLogs(Request $request)
    {
        $logs = ActivityLog::orderByDesc('created_at')
            ->paginate($request->integer('per_page', 5));

        $logs->getCollection()->transform(function ($log) {
            $log->time_ago = $log->created_at->diffForHumans();

            return $log;
        });

        return response()->json(['logs' => $logs], 200);
    }
}
