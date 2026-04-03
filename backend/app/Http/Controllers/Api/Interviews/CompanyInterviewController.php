<?php

namespace App\Http\Controllers\Api\Interviews;

use App\Http\Controllers\Controller;
use App\Http\Requests\Interviews\StoreInterviewRequest;
use App\Http\Requests\Interviews\UpdateInterviewRequest;
use App\Http\Requests\Interviews\UpdateResultRequest;
use App\Http\Resources\CompanyInterviewResource;
use App\Models\CompanyInterview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyInterviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = CompanyInterview::with(['user', 'company', 'internship']);

        $user = $request->user();
        $roleSlug = $user->role?->slug;

        if ($roleSlug === 'intern') {
            $query->where('user_id', $user->id);
        } elseif ($roleSlug === 'tutor') {
            $query->whereHas('user', fn ($q) => $q->where('tutor_id', $user->id));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->input('company_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('result')) {
            $query->where('result', $request->input('result'));
        }

        $interviews = $query->latest('interview_date')->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => CompanyInterviewResource::collection($interviews),
            'meta' => [
                'current_page' => $interviews->currentPage(),
                'last_page' => $interviews->lastPage(),
                'per_page' => $interviews->perPage(),
                'total' => $interviews->total(),
            ],
        ]);
    }

    public function store(StoreInterviewRequest $request): JsonResponse
    {
        $interview = CompanyInterview::create($request->validated());
        $interview->load(['user', 'company', 'internship']);

        return response()->json([
            'message' => 'Interview scheduled successfully.',
            'data' => new CompanyInterviewResource($interview),
        ], 201);
    }

    public function show(CompanyInterview $interview): JsonResponse
    {
        $interview->load(['user', 'company', 'internship']);

        return response()->json([
            'data' => new CompanyInterviewResource($interview),
        ]);
    }

    public function update(UpdateInterviewRequest $request, CompanyInterview $interview): JsonResponse
    {
        $interview->update($request->validated());
        $interview->load(['user', 'company', 'internship']);

        return response()->json([
            'message' => 'Interview updated successfully.',
            'data' => new CompanyInterviewResource($interview),
        ]);
    }

    public function destroy(CompanyInterview $interview): JsonResponse
    {
        $interview->delete();

        return response()->json([
            'message' => 'Interview deleted successfully.',
        ]);
    }

    public function updateResult(UpdateResultRequest $request, CompanyInterview $interview): JsonResponse
    {
        if (in_array($interview->result, ['passed', 'failed'])) {
            return response()->json([
                'message' => 'Result cannot be changed once it is passed or failed.',
            ], 422);
        }

        $interview->update([
            'result' => $request->validated('result'),
            'feedback' => $request->validated('feedback'),
        ]);

        $interview->load(['user', 'company', 'internship']);

        return response()->json([
            'message' => 'Interview result updated successfully.',
            'data' => new CompanyInterviewResource($interview),
        ]);
    }
}
