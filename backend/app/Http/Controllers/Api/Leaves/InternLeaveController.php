<?php

namespace App\Http\Controllers\Api\Leaves;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternLeaveResource;
use App\Models\InternLeave;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternLeaveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $roleSlug = $user->role?->slug;
        $query = InternLeave::with(['user', 'reviewer']);

        // Interns see only their own leaves
        if ($roleSlug === 'intern') {
            $query->where('user_id', $user->id);
        } elseif ($roleSlug === 'tutor') {
            // Tutors see leaves of their assigned interns
            $internIds = \App\Models\User::where('tutor_id', $user->id)->pluck('id');
            $query->whereIn('user_id', $internIds);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $leaves = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => InternLeaveResource::collection($leaves),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'per_page' => $leaves->perPage(),
                'total' => $leaves->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:personal,sick,emergency,other'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string'],
        ]);

        $data['user_id'] = $request->user()->id;

        // Enforce max leave days
        $maxDays = (int) \App\Models\Setting::getValue('max_leave_days_per_intern', '5');
        $requestedDays = (int) ceil((strtotime($data['end_date']) - strtotime($data['start_date'])) / 86400) + 1;
        $usedDays = InternLeave::where('user_id', $data['user_id'])
            ->whereIn('status', ['pending', 'approved'])
            ->get()
            ->sum(fn ($l) => (int) ceil((strtotime($l->end_date) - strtotime($l->start_date)) / 86400) + 1);
        if (($usedDays + $requestedDays) > $maxDays) {
            $remaining = max(0, $maxDays - $usedDays);
            return response()->json(['message' => "You can only take {$remaining} more day(s) of leave. Maximum is {$maxDays} days."], 422);
        }

        $leave = InternLeave::create($data);
        $leave->load(['user', 'reviewer']);

        return response()->json([
            'message' => 'Leave request submitted successfully.',
            'data' => new InternLeaveResource($leave),
        ], 201);
    }

    public function show(InternLeave $leave): JsonResponse
    {
        $leave->load(['user', 'reviewer']);

        return response()->json([
            'data' => new InternLeaveResource($leave),
        ]);
    }

    public function review(Request $request, InternLeave $leave): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected'],
            'review_note' => ['nullable', 'string'],
        ]);

        $leave->update([
            'status' => $data['status'],
            'review_note' => $data['review_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $leave->load(['user', 'reviewer']);

        return response()->json([
            'message' => 'Leave request ' . $data['status'] . '.',
            'data' => new InternLeaveResource($leave),
        ]);
    }

    public function destroy(InternLeave $leave): JsonResponse
    {
        if ($leave->status !== 'pending') {
            return response()->json(['message' => 'Only pending leaves can be deleted.'], 422);
        }

        $leave->delete();

        return response()->json([
            'message' => 'Leave request deleted.',
        ]);
    }
}
