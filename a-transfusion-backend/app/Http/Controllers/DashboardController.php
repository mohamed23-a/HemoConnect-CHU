<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Demande;
use App\Models\BloodStock;
use App\Models\Transfusion;
use App\Models\ActivityLog;
use App\Http\Resources\DemandeResource;
use App\Http\Resources\BloodStockResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics based on user role.
     */
    public function getStats(Request $request)
    {
        $user = $request->user();
        
        $stats = [];
        
        switch ($user->role) {
            case 'admin':
                $stats = $this->getAdminStats();
                break;
            case 'blood_center':
                $stats = $this->getBloodCenterStats();
                break;
            case 'hospital':
                $stats = $this->getHospitalStats($user->id);
                break;
        }
        
        return response()->json([
            'success' => true,
            'role' => $user->role,
            'data' => $stats
        ]);
    }
    
    /**
     * Get statistics for admin.
     */
    private function getAdminStats()
    {
        // إحصائيات المستخدمين
        $users = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->get()
            ->pluck('count', 'role');
        
        // إحصائيات الطلبات
        $demandes = Demande::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
        
        // إحصائيات عمليات النقل
        $transfusionsByMonth = Transfusion::select(
                DB::raw('DATE_FORMAT(processed_at, "%Y-%m") as month'),
                DB::raw('count(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();
        
        // المخزون
        $bloodStock = BloodStock::all();
        
        // أحدث النشاطات
        $recentActivities = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        return [
            'users_count' => User::count(),
            'users_by_role' => $users,
            'active_users' => User::where('is_active', true)->count(),
            'demandes_count' => Demande::count(),
            'demandes_by_status' => $demandes,
            'pending_demandes' => Demande::where('status', 'pending')->count(),
            'transfusions_count' => Transfusion::count(),
            'transfusions_by_month' => $transfusionsByMonth,
            'blood_stock_summary' => [
                'total_units' => $bloodStock->sum('quantity'),
                'low_stock_count' => $bloodStock->filter(fn($s) => $s->isLow())->count(),
                'by_type' => $bloodStock->map(function($stock) {
                    return [
                        'blood_type' => $stock->blood_type,
                        'quantity' => $stock->quantity,
                        'status' => $stock->status,
                    ];
                }),
            ],
            'recent_activities' => $recentActivities,
        ];
    }
    
    /**
     * Get statistics for blood center.
     */
    private function getBloodCenterStats()
    {
        $bloodStock = BloodStock::all();
        
        // الطلبات حسب الحالة
        $demandesByStatus = Demande::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
        
        // الطلبات حسب فصيلة الدم
        $demandesByBloodType = Demande::select('blood_type', DB::raw('count(*) as count'))
            ->whereIn('status', ['pending', 'approved'])
            ->groupBy('blood_type')
            ->get();
        
        // الطلبات العاجلة
        $urgentDemandes = Demande::whereIn('urgency', ['urgent', 'emergency'])
            ->where('status', 'pending')
            ->count();
        
        // عمليات النقل اليوم
        $todayTransfusions = Transfusion::whereDate('processed_at', today())->count();
        
        // أحدث الطلبات
        $recentDemandes = Demande::with('hospital')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        return [
            'blood_stock' => BloodStockResource::collection($bloodStock),
            'total_blood_units' => $bloodStock->sum('quantity'),
            'low_stock_alerts' => $bloodStock->filter(fn($s) => $s->isLow())->values(),
            'demandes_by_status' => $demandesByStatus,
            'pending_demandes' => Demande::where('status', 'pending')->count(),
            'approved_demandes' => Demande::where('status', 'approved')->count(),
            'completed_demandes' => Demande::where('status', 'completed')->count(),
            'rejected_demandes' => Demande::where('status', 'rejected')->count(),
            'urgent_pending_demandes' => $urgentDemandes,
            'demandes_by_blood_type' => $demandesByBloodType,
            'today_transfusions' => $todayTransfusions,
            'recent_demandes' => DemandeResource::collection($recentDemandes),
        ];
    }
    
    /**
     * Get statistics for hospital.
     */
    private function getHospitalStats($hospitalId)
    {
        // طلبات المستشفى حسب الحالة
        $demandesByStatus = Demande::where('user_id', $hospitalId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
        
        // طلبات المستشفى حسب فصيلة الدم
        $demandesByBloodType = Demande::where('user_id', $hospitalId)
            ->select('blood_type', DB::raw('count(*) as count'))
            ->groupBy('blood_type')
            ->get();
        
        // متوسط وقت المعالجة (بالساعات)
        $avgProcessingTime = Demande::where('user_id', $hospitalId)
            ->whereNotNull('treated_at')
            ->where('status', '!=', 'pending')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, treated_at)) as avg_hours'))
            ->first();
        
        // عمليات النقل المنجزة
        $completedTransfusions = Demande::where('user_id', $hospitalId)
            ->where('status', 'completed')
            ->count();
        
        // أحدث الطلبات
        $recentDemandes = Demande::where('user_id', $hospitalId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        return [
            'total_demandes' => Demande::where('user_id', $hospitalId)->count(),
            'pending_demandes' => $demandesByStatus['pending'] ?? 0,
            'approved_demandes' => $demandesByStatus['approved'] ?? 0,
            'rejected_demandes' => $demandesByStatus['rejected'] ?? 0,
            'completed_demandes' => $demandesByStatus['completed'] ?? 0,
            'demandes_by_status' => $demandesByStatus,
            'demandes_by_blood_type' => $demandesByBloodType,
            'avg_processing_time_hours' => round($avgProcessingTime->avg_hours ?? 0, 1),
            'completed_transfusions' => $completedTransfusions,
            'recent_demandes' => DemandeResource::collection($recentDemandes),
        ];
    }
    
    /**
     * Get recent activity for current user.
     */
    public function getRecentActivity(Request $request)
    {
        $user = $request->user();
        
        $query = ActivityLog::with('user');
        
        // إذا لم يكن admin، نعرض فقط نشاطات المستخدم
        if ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }
        
        $activities = $query->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }
    
    /**
     * Get all activity logs (admin only).
     */
    public function getActivityLogs(Request $request)
    {
        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return response()->json([
            'success' => true,
            'data' => $logs,
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ]
        ]);
    }
}