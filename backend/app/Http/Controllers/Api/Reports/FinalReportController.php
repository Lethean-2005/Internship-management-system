<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\StoreReportRequest;
use App\Http\Requests\Reports\UpdateReportRequest;
use App\Http\Requests\Reports\ReviewReportRequest;
use App\Http\Resources\FinalReportResource;
use App\Models\FinalReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinalReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FinalReport::with(['user', 'internship', 'reviewer']);

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

        if ($request->filled('internship_id')) {
            $query->where('internship_id', $request->input('internship_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $reports = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => FinalReportResource::collection($reports),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function store(StoreReportRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $report = FinalReport::create($data);
        $report->load(['user', 'internship']);

        return response()->json([
            'message' => 'Report created successfully.',
            'data' => new FinalReportResource($report),
        ], 201);
    }

    public function show(FinalReport $report): JsonResponse
    {
        $report->load(['user', 'internship', 'reviewer']);

        return response()->json([
            'data' => new FinalReportResource($report),
        ]);
    }

    public function update(UpdateReportRequest $request, FinalReport $report): JsonResponse
    {
        if ($report->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft reports can be updated.',
            ], 422);
        }

        $report->update($request->validated());
        $report->load(['user', 'internship', 'reviewer']);

        return response()->json([
            'message' => 'Report updated successfully.',
            'data' => new FinalReportResource($report),
        ]);
    }

    public function destroy(FinalReport $report): JsonResponse
    {
        if ($report->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft reports can be deleted.',
            ], 422);
        }

        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully.',
        ]);
    }

    public function submit(FinalReport $report): JsonResponse
    {
        if ($report->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft reports can be submitted.',
            ], 422);
        }

        $report->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $report->load(['user', 'internship']);

        return response()->json([
            'message' => 'Report submitted successfully.',
            'data' => new FinalReportResource($report),
        ]);
    }

    public function review(ReviewReportRequest $request, FinalReport $report): JsonResponse
    {
        if ($report->status !== 'submitted') {
            return response()->json([
                'message' => 'Only submitted reports can be reviewed.',
            ], 422);
        }

        $report->update([
            'status' => $request->validated('status'),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'feedback' => $request->validated('feedback'),
            'grade' => $request->validated('grade'),
        ]);

        $report->load(['user', 'internship', 'reviewer']);

        return response()->json([
            'message' => 'Report reviewed successfully.',
            'data' => new FinalReportResource($report),
        ]);
    }

    public function upload(Request $request, FinalReport $report): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $path = $request->file('file')->store('reports', 'public');

        $report->update(['file_path' => $path]);

        return response()->json([
            'message' => 'File uploaded successfully.',
            'data' => new FinalReportResource($report->fresh(['user', 'internship', 'reviewer'])),
        ]);
    }
}
