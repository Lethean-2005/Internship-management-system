<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Companies\CompanyController;
use App\Http\Controllers\Api\Contacts\SupervisorContactController;
use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\Internships\InternshipController;
use App\Http\Controllers\Api\Interviews\CompanyInterviewController;
use App\Http\Controllers\Api\Reports\FinalReportController;
use App\Http\Controllers\Api\Roles\RoleController;
use App\Http\Controllers\Api\Slides\FinalSlideController;
use App\Http\Controllers\Api\Users\UserController;
use App\Http\Controllers\Api\Worklogs\WeeklyWorklogController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public lists for registration
Route::get('/public/companies', [CompanyController::class, 'index']);
Route::get('/public/internships', [InternshipController::class, 'index']);
Route::get('/public/roles', function () {
    return response()->json([
        'data' => \App\Models\Role::select('id', 'name', 'slug', 'description')->get(),
    ]);
});
Route::get('/public/tutors', function () {
    $tutorRole = \App\Models\Role::where('slug', 'tutor')->first();
    return response()->json([
        'data' => $tutorRole ? \App\Models\User::where('role_id', $tutorRole->id)->where('is_active', true)->select('id', 'name', 'email', 'department')->get() : [],
    ]);
});
Route::get('/public/supervisors', function () {
    $supervisorRole = \App\Models\Role::where('slug', 'supervisor')->first();
    return response()->json([
        'data' => $supervisorRole ? \App\Models\User::where('role_id', $supervisorRole->id)->where('is_active', true)->select('id', 'name', 'email', 'department')->get() : [],
    ]);
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard — all roles
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Users — admin only
    Route::middleware('role:admin')->group(function (): void {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);
    });

    // Roles — admin only
    Route::middleware('role:admin')->group(function (): void {
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::put('/roles/{role}', [RoleController::class, 'update']);
        Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
    });

    // Companies — admin, supervisor
    Route::middleware('role:admin,supervisor')->group(function (): void {
        Route::get('/companies', [CompanyController::class, 'index']);
        Route::post('/companies', [CompanyController::class, 'store']);
        Route::get('/companies/{company}', [CompanyController::class, 'show']);
        Route::put('/companies/{company}', [CompanyController::class, 'update']);
        Route::delete('/companies/{company}', [CompanyController::class, 'destroy']);
    });

    // Internships — all roles can view, admin/tutor/supervisor can manage
    Route::get('/internships', [InternshipController::class, 'index']);
    Route::get('/internships/{internship}', [InternshipController::class, 'show']);
    Route::post('/internships/{internship}/apply', [InternshipController::class, 'apply']);
    Route::middleware('role:admin,tutor,supervisor')->group(function (): void {
        Route::post('/internships', [InternshipController::class, 'store']);
        Route::put('/internships/{internship}', [InternshipController::class, 'update']);
        Route::delete('/internships/{internship}', [InternshipController::class, 'destroy']);
        Route::patch('/internships/{internship}/applications/{application}/review', [InternshipController::class, 'reviewApplication']);
    });

    // Weekly Worklogs — all roles (intern sees own, others see all)
    Route::get('/weekly-worklogs', [WeeklyWorklogController::class, 'index']);
    Route::get('/weekly-worklogs/{worklog}', [WeeklyWorklogController::class, 'show']);
    Route::middleware('role:admin,tutor,supervisor,intern')->group(function (): void {
        Route::post('/weekly-worklogs', [WeeklyWorklogController::class, 'store']);
        Route::put('/weekly-worklogs/{worklog}', [WeeklyWorklogController::class, 'update']);
        Route::delete('/weekly-worklogs/{worklog}', [WeeklyWorklogController::class, 'destroy']);
        Route::patch('/weekly-worklogs/{worklog}/submit', [WeeklyWorklogController::class, 'submit']);
    });
    Route::middleware('role:admin,tutor,supervisor')->group(function (): void {
        Route::patch('/weekly-worklogs/{worklog}/review', [WeeklyWorklogController::class, 'review']);
    });

    // Final Reports — all roles (intern sees own, tutor/supervisor/admin review)
    Route::get('/final-reports', [FinalReportController::class, 'index']);
    Route::get('/final-reports/{report}', [FinalReportController::class, 'show']);
    Route::middleware('role:admin,tutor,supervisor,intern')->group(function (): void {
        Route::post('/final-reports', [FinalReportController::class, 'store']);
        Route::put('/final-reports/{report}', [FinalReportController::class, 'update']);
        Route::delete('/final-reports/{report}', [FinalReportController::class, 'destroy']);
        Route::patch('/final-reports/{report}/submit', [FinalReportController::class, 'submit']);
        Route::post('/final-reports/{report}/upload', [FinalReportController::class, 'upload']);
    });
    Route::middleware('role:admin,tutor,supervisor')->group(function (): void {
        Route::patch('/final-reports/{report}/review', [FinalReportController::class, 'review']);
    });

    // Final Slides — all roles (intern sees own, tutor/supervisor/admin review)
    Route::get('/final-slides', [FinalSlideController::class, 'index']);
    Route::get('/final-slides/{slide}', [FinalSlideController::class, 'show']);
    Route::middleware('role:admin,tutor,supervisor,intern')->group(function (): void {
        Route::post('/final-slides', [FinalSlideController::class, 'store']);
        Route::put('/final-slides/{slide}', [FinalSlideController::class, 'update']);
        Route::delete('/final-slides/{slide}', [FinalSlideController::class, 'destroy']);
        Route::patch('/final-slides/{slide}/submit', [FinalSlideController::class, 'submit']);
        Route::post('/final-slides/{slide}/upload', [FinalSlideController::class, 'upload']);
    });
    Route::middleware('role:admin,tutor,supervisor')->group(function (): void {
        Route::patch('/final-slides/{slide}/review', [FinalSlideController::class, 'review']);
    });

    // Supervisor Contacts — all roles
    Route::get('/supervisor-contacts', [SupervisorContactController::class, 'index']);
    Route::post('/supervisor-contacts', [SupervisorContactController::class, 'store']);
    Route::get('/supervisor-contacts/{contact}', [SupervisorContactController::class, 'show']);
    Route::middleware('role:admin,tutor,supervisor')->group(function (): void {
        Route::patch('/supervisor-contacts/{contact}/reply', [SupervisorContactController::class, 'reply']);
    });

    // Company Interviews — admin, supervisor, intern
    Route::middleware('role:admin,supervisor,intern')->group(function (): void {
        Route::get('/company-interviews', [CompanyInterviewController::class, 'index']);
        Route::get('/company-interviews/{interview}', [CompanyInterviewController::class, 'show']);
    });
    Route::middleware('role:admin,supervisor')->group(function (): void {
        Route::post('/company-interviews', [CompanyInterviewController::class, 'store']);
        Route::put('/company-interviews/{interview}', [CompanyInterviewController::class, 'update']);
        Route::delete('/company-interviews/{interview}', [CompanyInterviewController::class, 'destroy']);
        Route::patch('/company-interviews/{interview}/result', [CompanyInterviewController::class, 'updateResult']);
    });
});
