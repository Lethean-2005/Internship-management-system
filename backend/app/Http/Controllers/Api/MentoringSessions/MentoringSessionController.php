<?php

namespace App\Http\Controllers\Api\MentoringSessions;

use App\Http\Controllers\Controller;
use App\Http\Requests\MentoringSessions\UpdateMentoringSessionRequest;
use App\Http\Resources\MentoringSessionResource;
use App\Models\MentoringSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentoringSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MentoringSession::with(['tutor', 'intern', 'internship']);

        $user = $request->user();
        $roleSlug = $user->role?->slug;

        if ($roleSlug === 'tutor') {
            $query->where('tutor_id', $user->id);
        } elseif ($roleSlug === 'intern') {
            $query->where('intern_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('intern_id')) {
            $query->where('intern_id', $request->input('intern_id'));
        }

        $sessions = $query->latest('scheduled_date')->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => MentoringSessionResource::collection($sessions),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'intern_ids' => ['required', 'array', 'min:1'],
            'intern_ids.*' => ['required', 'exists:users,id'],
            'internship_id' => ['nullable', 'exists:internships,id'],
            'title' => ['required', 'string', 'max:255'],
            'scheduled_date' => ['required', 'date'],
            'scheduled_time' => ['required', 'date_format:H:i'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'location' => ['nullable', 'string', 'max:500'],
            'meeting_link' => ['nullable', 'string', 'max:500'],
            'type' => ['required', 'in:in_person,online,hybrid'],
            'agenda' => ['nullable', 'string'],
        ]);

        $tutorId = $request->user()->id;
        $internIds = $data['intern_ids'];
        unset($data['intern_ids']);

        $sessions = [];
        foreach ($internIds as $internId) {
            $sessions[] = MentoringSession::create(array_merge($data, [
                'tutor_id' => $tutorId,
                'intern_id' => $internId,
            ]));
        }

        $last = end($sessions);
        $last->load(['tutor', 'intern', 'internship']);

        $message = count($sessions) > 1
            ? count($sessions) . ' mentoring sessions scheduled successfully.'
            : 'Mentoring session scheduled successfully.';

        return response()->json([
            'message' => $message,
            'data' => new MentoringSessionResource($last),
        ], 201);
    }

    public function show(MentoringSession $mentoringSession): JsonResponse
    {
        $mentoringSession->load(['tutor', 'intern', 'internship']);

        return response()->json([
            'data' => new MentoringSessionResource($mentoringSession),
        ]);
    }

    public function update(UpdateMentoringSessionRequest $request, MentoringSession $mentoringSession): JsonResponse
    {
        $user = $request->user();
        if ($mentoringSession->tutor_id !== $user->id && $user->role?->slug !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $mentoringSession->update($request->validated());
        $mentoringSession->load(['tutor', 'intern', 'internship']);

        return response()->json([
            'message' => 'Mentoring session updated successfully.',
            'data' => new MentoringSessionResource($mentoringSession),
        ]);
    }

    public function destroy(MentoringSession $mentoringSession, Request $request): JsonResponse
    {
        $user = $request->user();
        if ($mentoringSession->tutor_id !== $user->id && $user->role?->slug !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $mentoringSession->delete();

        return response()->json([
            'message' => 'Mentoring session deleted successfully.',
        ]);
    }

    public function cancel(Request $request, MentoringSession $mentoringSession): JsonResponse
    {
        $user = $request->user();
        if ($mentoringSession->tutor_id !== $user->id && $user->role?->slug !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'cancel_reason' => ['required', 'string'],
        ]);

        $mentoringSession->update([
            'status' => 'cancelled',
            'cancel_reason' => $data['cancel_reason'],
        ]);
        $mentoringSession->load(['tutor', 'intern', 'internship']);

        return response()->json([
            'message' => 'Mentoring session cancelled.',
            'data' => new MentoringSessionResource($mentoringSession),
        ]);
    }

    public function complete(Request $request, MentoringSession $mentoringSession): JsonResponse
    {
        $user = $request->user();
        if ($mentoringSession->tutor_id !== $user->id && $user->role?->slug !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'notes' => ['required', 'string'],
            'action_items' => ['nullable', 'string'],
        ]);

        $mentoringSession->update([
            'status' => 'completed',
            'notes' => $data['notes'],
            'action_items' => $data['action_items'] ?? null,
        ]);
        $mentoringSession->load(['tutor', 'intern', 'internship']);

        return response()->json([
            'message' => 'Mentoring session completed.',
            'data' => new MentoringSessionResource($mentoringSession),
        ]);
    }

    public function feedback(Request $request, MentoringSession $mentoringSession): JsonResponse
    {
        $user = $request->user();
        if ($mentoringSession->intern_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($mentoringSession->status !== 'completed') {
            return response()->json(['message' => 'Feedback can only be added to completed sessions.'], 422);
        }

        $data = $request->validate([
            'intern_feedback' => ['required', 'string'],
        ]);

        $mentoringSession->update(['intern_feedback' => $data['intern_feedback']]);
        $mentoringSession->load(['tutor', 'intern', 'internship']);

        return response()->json([
            'message' => 'Feedback submitted successfully.',
            'data' => new MentoringSessionResource($mentoringSession),
        ]);
    }
}
