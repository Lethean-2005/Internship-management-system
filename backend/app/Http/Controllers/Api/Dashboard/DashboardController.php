<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CompanyInterview;
use App\Models\FinalReport;
use App\Models\FinalSlide;
use App\Models\Internship;
use App\Models\Role;
use App\Models\User;
use App\Models\WeeklyWorklog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $roleSlug = $user->role?->slug;

        if ($roleSlug === 'tutor') {
            // Tutor sees only stats for their assigned interns
            $internIds = User::where('tutor_id', $user->id)->pluck('id');

            return response()->json([
                'data' => [
                    'total_interns' => $internIds->count(),
                    'pending_worklogs' => WeeklyWorklog::whereIn('user_id', $internIds)->where('status', 'submitted')->count(),
                    'pending_reports' => FinalReport::whereIn('user_id', $internIds)->where('status', 'submitted')->count(),
                    'pending_slides' => FinalSlide::whereIn('user_id', $internIds)->where('status', 'submitted')->count(),
                ],
            ]);
        }

        $internRole = Role::where('slug', 'intern')->first();

        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'total_interns' => $internRole ? User::where('role_id', $internRole->id)->count() : 0,
                'active_internships' => Internship::whereIn('status', ['open', 'in_progress'])->count(),
                'pending_worklogs' => WeeklyWorklog::where('status', 'submitted')->count(),
                'pending_reports' => FinalReport::where('status', 'submitted')->count(),
                'pending_slides' => FinalSlide::where('status', 'submitted')->count(),
                'upcoming_interviews' => CompanyInterview::where('status', 'scheduled')
                    ->where('interview_date', '>=', now())
                    ->count(),
            ],
        ]);
    }
}
