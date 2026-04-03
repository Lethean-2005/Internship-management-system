<?php

namespace App\Http\Controllers\Api\Internships;

use App\Http\Controllers\Controller;
use App\Http\Requests\Internships\StoreInternshipRequest;
use App\Http\Requests\Internships\UpdateInternshipRequest;
use App\Http\Requests\Internships\ReviewApplicationRequest;
use App\Http\Resources\InternshipResource;
use App\Http\Resources\InternshipApplicationResource;
use App\Models\Internship;
use App\Models\InternshipApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternshipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Internship::with(['company', 'creator'])->withCount('applications');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->input('company_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $internships = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => InternshipResource::collection($internships),
            'meta' => [
                'current_page' => $internships->currentPage(),
                'last_page' => $internships->lastPage(),
                'per_page' => $internships->perPage(),
                'total' => $internships->total(),
            ],
        ]);
    }

    public function store(StoreInternshipRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $internship = Internship::create($data);
        $internship->load(['company', 'creator']);

        return response()->json([
            'message' => 'Internship created successfully.',
            'data' => new InternshipResource($internship),
        ], 201);
    }

    public function show(Internship $internship): JsonResponse
    {
        $internship->load(['company', 'creator', 'applications.user']);
        $internship->loadCount('applications');

        return response()->json([
            'data' => new InternshipResource($internship),
        ]);
    }

    public function update(UpdateInternshipRequest $request, Internship $internship): JsonResponse
    {
        $internship->update($request->validated());
        $internship->load(['company', 'creator']);

        return response()->json([
            'message' => 'Internship updated successfully.',
            'data' => new InternshipResource($internship),
        ]);
    }

    public function destroy(Internship $internship): JsonResponse
    {
        $internship->delete();

        return response()->json([
            'message' => 'Internship deleted successfully.',
        ]);
    }

    public function apply(Request $request, Internship $internship): JsonResponse
    {
        if ($internship->status !== 'open') {
            return response()->json([
                'message' => 'This internship is not accepting applications.',
            ], 422);
        }

        $existing = InternshipApplication::where('internship_id', $internship->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'You have already applied for this internship.',
            ], 422);
        }

        $application = InternshipApplication::create([
            'internship_id' => $internship->id,
            'user_id' => $request->user()->id,
            'status' => 'pending',
            'applied_at' => now(),
            'notes' => $request->input('notes'),
        ]);

        $application->load(['internship', 'user']);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'data' => new InternshipApplicationResource($application),
        ], 201);
    }

    public function reviewApplication(ReviewApplicationRequest $request, Internship $internship, InternshipApplication $application): JsonResponse
    {
        if ($application->internship_id !== $internship->id) {
            return response()->json([
                'message' => 'Application does not belong to this internship.',
            ], 422);
        }

        $application->update([
            'status' => $request->validated('status'),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'notes' => $request->validated('notes') ?? $application->notes,
        ]);

        $application->load(['internship', 'user', 'reviewer']);

        return response()->json([
            'message' => 'Application reviewed successfully.',
            'data' => new InternshipApplicationResource($application),
        ]);
    }
}
