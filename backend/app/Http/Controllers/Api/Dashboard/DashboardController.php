<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\CompanyInterview;
use App\Models\FinalReport;
use App\Models\FinalSlide;
use App\Models\Internship;
use App\Models\MentoringSession;
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

        if ($roleSlug === 'admin') {
            $internRole = Role::where('slug', 'intern')->first();
            return response()->json([
                'data' => [
                    'total_users' => User::count(),
                    'total_interns' => $internRole ? User::where('role_id', $internRole->id)->count() : 0,
                    'total_tutors' => Role::where('slug', 'tutor')->first()?->users()->count() ?? 0,
                    'total_supervisors' => Role::where('slug', 'supervisor')->first()?->users()->count() ?? 0,
                    'pending_worklogs' => WeeklyWorklog::where('status', 'submitted')->count(),
                    'pending_reports' => FinalReport::where('status', 'submitted')->count(),
                    'pending_slides' => FinalSlide::where('status', 'submitted')->count(),
                    'upcoming_interviews' => CompanyInterview::where('status', 'scheduled')->count(),
                    'upcoming_sessions' => MentoringSession::where('status', 'scheduled')->where('scheduled_date', '>=', today())->count(),
                ],
            ]);
        }

        if ($roleSlug === 'tutor') {
            $internIds = User::where('tutor_id', $user->id)->pluck('id');
            return response()->json([
                'data' => [
                    'my_interns' => $internIds->count(),
                    'pending_worklogs' => WeeklyWorklog::whereIn('user_id', $internIds)->where('status', 'submitted')->count(),
                    'pending_reports' => FinalReport::whereIn('user_id', $internIds)->where('status', 'submitted')->count(),
                    'pending_slides' => FinalSlide::whereIn('user_id', $internIds)->where('status', 'submitted')->count(),
                    'total_worklogs' => WeeklyWorklog::whereIn('user_id', $internIds)->count(),
                    'approved_reports' => FinalReport::whereIn('user_id', $internIds)->where('status', 'approved')->count(),
                    'approved_slides' => FinalSlide::whereIn('user_id', $internIds)->where('status', 'approved')->count(),
                    'upcoming_sessions' => MentoringSession::where('tutor_id', $user->id)->where('status', 'scheduled')->where('scheduled_date', '>=', today())->count(),
                ],
            ]);
        }

        // Intern
        return response()->json([
            'data' => [
                'my_worklogs' => WeeklyWorklog::where('user_id', $user->id)->count(),
                'submitted_worklogs' => WeeklyWorklog::where('user_id', $user->id)->where('status', 'submitted')->count(),
                'approved_worklogs' => WeeklyWorklog::where('user_id', $user->id)->where('status', 'approved')->count(),
                'my_reports' => FinalReport::where('user_id', $user->id)->count(),
                'my_slides' => FinalSlide::where('user_id', $user->id)->count(),
                'my_interviews' => CompanyInterview::where('user_id', $user->id)->count(),
                'passed_interviews' => CompanyInterview::where('user_id', $user->id)->where('result', 'passed')->count(),
                'upcoming_sessions' => MentoringSession::where('intern_id', $user->id)->where('status', 'scheduled')->where('scheduled_date', '>=', today())->count(),
            ],
        ]);
    }
}
