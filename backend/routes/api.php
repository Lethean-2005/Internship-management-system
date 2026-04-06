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
use App\Http\Controllers\Api\JobPostings\JobPostingController;
use App\Http\Controllers\Api\Leaves\InternLeaveController;
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

    // Update own profile (internship details)
    Route::put('/me', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $data = $request->validate([
            'company_name' => ['sometimes', 'string', 'max:255'],
            'position' => ['sometimes', 'string', 'max:255'],
            'allowance' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'supervisor_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'tutor_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'generation' => ['sometimes', 'nullable', 'string', 'max:10'],
        ]);
        $user->update($data);
        $user->load('role');
        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => new \App\Http\Resources\UserResource($user),
        ]);
    });

    // Dashboard — all roles
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Deadlines
    Route::post('/deadlines', function (\Illuminate\Http\Request $request) {
        $data = $request->validate([
            'type' => ['required', 'in:final_slide,final_report'],
            'deadline' => ['required', 'date'],
        ]);
        $data['tutor_id'] = $request->user()->id;
        $deadline = \App\Models\Deadline::updateOrCreate(
            ['tutor_id' => $data['tutor_id'], 'type' => $data['type']],
            ['deadline' => $data['deadline']]
        );
        return response()->json(['message' => 'Deadline set.', 'data' => $deadline]);
    })->middleware('role:tutor');

    Route::get('/deadlines/{type}', function (\Illuminate\Http\Request $request, string $type) {
        $user = $request->user();
        $roleSlug = $user->role?->slug;
        if ($roleSlug === 'tutor') {
            $deadline = \App\Models\Deadline::where('tutor_id', $user->id)->where('type', $type)->first();
        } elseif ($roleSlug === 'intern' && $user->tutor_id) {
            $deadline = \App\Models\Deadline::where('tutor_id', $user->tutor_id)->where('type', $type)->first();
        } else {
            $deadline = null;
        }
        return response()->json(['data' => $deadline]);
    });

    // My Interns — tutor only
    Route::middleware('role:tutor')->group(function (): void {
        // List all interns for search/assign
        Route::get('/interns-list', function (\Illuminate\Http\Request $request) {
            $interns = \App\Models\User::with('role')
                ->whereHas('role', fn ($q) => $q->where('slug', 'intern'))
                ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', '%' . $request->input('search') . '%'))
                ->latest()
                ->get();
            return response()->json(['data' => \App\Http\Resources\UserResource::collection($interns)]);
        });

        Route::get('/my-interns/{internId}/interviews', function (\Illuminate\Http\Request $request, int $internId) {
            $user = $request->user();
            // Verify this intern belongs to this tutor
            $intern = \App\Models\User::where('id', $internId)->where('tutor_id', $user->id)->first();
            if (!$intern) {
                return response()->json(['message' => 'Intern not found.'], 404);
            }
            $interviews = \App\Models\CompanyInterview::with(['user', 'company'])
                ->where('user_id', $internId)
                ->latest('interview_date')
                ->get();
            return response()->json([
                'data' => \App\Http\Resources\CompanyInterviewResource::collection($interviews),
            ]);
        });

        // Choose intern — assign tutor_id
        Route::post('/my-interns/choose', function (\Illuminate\Http\Request $request) {
            $request->validate(['user_id' => 'required|exists:users,id']);
            $intern = \App\Models\User::findOrFail($request->user_id);
            if ($intern->role?->slug !== 'intern') {
                return response()->json(['message' => 'User is not an intern.'], 422);
            }
            if ($intern->tutor_id && $intern->tutor_id !== $request->user()->id) {
                return response()->json(['message' => 'This intern is already assigned to another tutor.'], 422);
            }
            $intern->update(['tutor_id' => $request->user()->id]);
            return response()->json(['message' => 'Intern assigned successfully.', 'data' => new \App\Http\Resources\UserResource($intern)]);
        });

        // Remove intern from tutor
        Route::delete('/my-interns/{internId}', function (\Illuminate\Http\Request $request, int $internId) {
            $intern = \App\Models\User::where('id', $internId)->where('tutor_id', $request->user()->id)->first();
            if (!$intern) {
                return response()->json(['message' => 'Intern not found.'], 404);
            }
            $intern->update(['tutor_id' => null]);
            return response()->json(['message' => 'Intern removed successfully.']);
        });

        Route::get('/my-interns', function (\Illuminate\Http\Request $request) {
            $user = $request->user();
            $interns = \App\Models\User::with('role')
                ->where('tutor_id', $user->id)
                ->latest()
                ->paginate(50);

            return response()->json([
                'data' => \App\Http\Resources\UserResource::collection($interns),
                'meta' => [
                    'current_page' => $interns->currentPage(),
                    'last_page' => $interns->lastPage(),
                    'per_page' => $interns->perPage(),
                    'total' => $interns->total(),
                ],
            ]);
        });
    });

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
    Route::middleware('role:admin,supervisor,intern')->group(function (): void {
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
        Route::put('/company-interviews/{interview}', [CompanyInterviewController::class, 'update']);
    });
    Route::middleware('role:admin,supervisor,intern')->group(function (): void {
        Route::patch('/company-interviews/{interview}/result', [CompanyInterviewController::class, 'updateResult']);
    });
    Route::middleware('role:admin,supervisor,intern')->group(function (): void {
        Route::post('/company-interviews', [CompanyInterviewController::class, 'store']);
    });
    Route::middleware('role:admin,supervisor')->group(function (): void {
        Route::delete('/company-interviews/{interview}', [CompanyInterviewController::class, 'destroy']);
    });

    // Job Postings — all roles can view, admin can manage
    Route::get('/job-postings', [JobPostingController::class, 'index']);
    Route::get('/job-postings/{jobPosting}', [JobPostingController::class, 'show']);
    Route::middleware('role:admin')->group(function (): void {
        Route::post('/job-postings', [JobPostingController::class, 'store']);
        Route::put('/job-postings/{jobPosting}', [JobPostingController::class, 'update']);
        Route::delete('/job-postings/{jobPosting}', [JobPostingController::class, 'destroy']);
    });

    // Intern Leaves — intern can create/view own, tutor/admin/supervisor can review
    Route::get('/intern-leaves', [InternLeaveController::class, 'index']);
    Route::get('/intern-leaves/{leave}', [InternLeaveController::class, 'show']);
    Route::middleware('role:intern')->group(function (): void {
        Route::post('/intern-leaves', [InternLeaveController::class, 'store']);
        Route::delete('/intern-leaves/{leave}', [InternLeaveController::class, 'destroy']);
    });
    Route::middleware('role:admin,tutor,supervisor')->group(function (): void {
        Route::patch('/intern-leaves/{leave}/review', [InternLeaveController::class, 'review']);
    });
});
