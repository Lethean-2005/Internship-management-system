<?php

namespace App\Http\Controllers\Api\Worklogs;

use App\Http\Controllers\Controller;
use App\Http\Requests\Worklogs\StoreWorklogRequest;
use App\Http\Requests\Worklogs\UpdateWorklogRequest;
use App\Http\Requests\Worklogs\ReviewWorklogRequest;
use App\Http\Resources\WeeklyWorklogResource;
use App\Models\WeeklyWorklog;
use App\Models\WorklogEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeeklyWorklogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WeeklyWorklog::with(['user', 'internship', 'reviewer', 'entries']);

        $user = $request->user();
        $roleSlug = $user->role?->slug;

        if ($roleSlug === 'intern') {
            $query->where('user_id', $user->id);
        } elseif ($roleSlug === 'tutor') {
            $query->whereHas('user', fn ($q) => $q->where('tutor_id', $user->id))
                  ->whereNotIn('status', ['draft']);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('internship_id')) {
            $query->where('internship_id', $request->input('internship_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('week_number')) {
            $query->where('week_number', $request->input('week_number'));
        }

        $worklogs = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => WeeklyWorklogResource::collection($worklogs),
            'meta' => [
                'current_page' => $worklogs->currentPage(),
                'last_page' => $worklogs->lastPage(),
                'per_page' => $worklogs->perPage(),
                'total' => $worklogs->total(),
            ],
        ]);
    }

    public function store(StoreWorklogRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $entries = $data['entries'] ?? [];
        unset($data['entries']);

        $worklog = WeeklyWorklog::create($data);

        foreach ($entries as $entry) {
            $worklog->entries()->create($entry);
        }

        $worklog->load(['user', 'internship', 'entries']);

        return response()->json([
            'message' => 'Worklog created successfully.',
            'data' => new WeeklyWorklogResource($worklog),
        ], 201);
    }

    public function show(WeeklyWorklog $worklog): JsonResponse
    {
        $worklog->load(['user', 'internship', 'reviewer', 'entries']);

        return response()->json([
            'data' => new WeeklyWorklogResource($worklog),
        ]);
    }

    public function update(UpdateWorklogRequest $request, WeeklyWorklog $worklog): JsonResponse
    {
        if (!in_array($worklog->status, ['draft', 'rejected'])) {
            return response()->json([
                'message' => 'Only draft or rejected worklogs can be updated.',
            ], 422);
        }

        $data = $request->validated();
        $entries = $data['entries'] ?? null;
        unset($data['entries']);

        $worklog->update($data);

        if ($entries !== null) {
            $worklog->entries()->delete();
            foreach ($entries as $entry) {
                $worklog->entries()->create($entry);
            }
        }

        $worklog->load(['user', 'internship', 'reviewer', 'entries']);

        return response()->json([
            'message' => 'Worklog updated successfully.',
            'data' => new WeeklyWorklogResource($worklog),
        ]);
    }

    public function destroy(WeeklyWorklog $worklog): JsonResponse
    {
        $user = request()->user();
        $roleSlug = $user->role?->slug;

        if ($roleSlug === 'intern') {
            return response()->json([
                'message' => 'Interns cannot delete worklogs.',
            ], 403);
        }

        if (!in_array($worklog->status, ['draft', 'rejected'])) {
            return response()->json([
                'message' => 'Only draft or rejected worklogs can be deleted.',
            ], 422);
        }

        $worklog->delete();

        return response()->json([
            'message' => 'Worklog deleted successfully.',
        ]);
    }

    public function submit(WeeklyWorklog $worklog): JsonResponse
    {
        if (!in_array($worklog->status, ['draft', 'rejected'])) {
            return response()->json([
                'message' => 'Only draft or rejected worklogs can be submitted.',
            ], 422);
        }

        $newStatus = $worklog->status === 'rejected' ? 'resubmitted' : 'submitted';

        $worklog->update([
            'status' => $newStatus,
            'submitted_at' => now(),
        ]);

        $worklog->load(['user', 'internship']);

        return response()->json([
            'message' => 'Worklog ' . $newStatus . ' successfully.',
            'data' => new WeeklyWorklogResource($worklog),
        ]);
    }

    public function review(ReviewWorklogRequest $request, WeeklyWorklog $worklog): JsonResponse
    {
        if (!in_array($worklog->status, ['submitted', 'resubmitted'])) {
            return response()->json([
                'message' => 'Only submitted worklogs can be reviewed.',
            ], 422);
        }

        $worklog->update([
            'status' => $request->validated('status'),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'feedback' => $request->validated('feedback'),
        ]);

        $worklog->load(['user', 'internship', 'reviewer']);

        return response()->json([
            'message' => 'Worklog reviewed successfully.',
            'data' => new WeeklyWorklogResource($worklog),
        ]);
    }
}
