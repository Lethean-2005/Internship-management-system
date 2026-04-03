<?php

namespace App\Http\Controllers\Api\Slides;

use App\Http\Controllers\Controller;
use App\Http\Requests\Slides\StoreSlideRequest;
use App\Http\Requests\Slides\UpdateSlideRequest;
use App\Http\Requests\Slides\ReviewSlideRequest;
use App\Http\Resources\FinalSlideResource;
use App\Models\FinalSlide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinalSlideController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FinalSlide::with(['user', 'internship', 'reviewer']);

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

        $slides = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => FinalSlideResource::collection($slides),
            'meta' => [
                'current_page' => $slides->currentPage(),
                'last_page' => $slides->lastPage(),
                'per_page' => $slides->perPage(),
                'total' => $slides->total(),
            ],
        ]);
    }

    public function store(StoreSlideRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $slide = FinalSlide::create($data);
        $slide->load(['user', 'internship']);

        return response()->json([
            'message' => 'Slide created successfully.',
            'data' => new FinalSlideResource($slide),
        ], 201);
    }

    public function show(FinalSlide $slide): JsonResponse
    {
        $slide->load(['user', 'internship', 'reviewer']);

        return response()->json([
            'data' => new FinalSlideResource($slide),
        ]);
    }

    public function update(UpdateSlideRequest $request, FinalSlide $slide): JsonResponse
    {
        if ($slide->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft slides can be updated.',
            ], 422);
        }

        $slide->update($request->validated());
        $slide->load(['user', 'internship', 'reviewer']);

        return response()->json([
            'message' => 'Slide updated successfully.',
            'data' => new FinalSlideResource($slide),
        ]);
    }

    public function destroy(FinalSlide $slide): JsonResponse
    {
        if ($slide->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft slides can be deleted.',
            ], 422);
        }

        $slide->delete();

        return response()->json([
            'message' => 'Slide deleted successfully.',
        ]);
    }

    public function submit(FinalSlide $slide): JsonResponse
    {
        if ($slide->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft slides can be submitted.',
            ], 422);
        }

        $slide->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $slide->load(['user', 'internship']);

        return response()->json([
            'message' => 'Slide submitted successfully.',
            'data' => new FinalSlideResource($slide),
        ]);
    }

    public function review(ReviewSlideRequest $request, FinalSlide $slide): JsonResponse
    {
        if ($slide->status !== 'submitted') {
            return response()->json([
                'message' => 'Only submitted slides can be reviewed.',
            ], 422);
        }

        $slide->update([
            'status' => $request->validated('status'),
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'feedback' => $request->validated('feedback'),
        ]);

        $slide->load(['user', 'internship', 'reviewer']);

        return response()->json([
            'message' => 'Slide reviewed successfully.',
            'data' => new FinalSlideResource($slide),
        ]);
    }

    public function upload(Request $request, FinalSlide $slide): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,ppt,pptx,key,odp,jpg,jpeg,png,mp4,zip|max:51200',
        ]);

        $path = $request->file('file')->store('slides', 'public');

        $slide->update(['file_path' => $path]);

        return response()->json([
            'message' => 'File uploaded successfully.',
            'data' => new FinalSlideResource($slide->fresh(['user', 'internship', 'reviewer'])),
        ]);
    }
}
