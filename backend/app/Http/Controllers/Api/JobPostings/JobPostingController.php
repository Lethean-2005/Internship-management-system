<?php

namespace App\Http\Controllers\Api\JobPostings;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobPostings\StoreJobPostingRequest;
use App\Http\Requests\JobPostings\UpdateJobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobPostingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JobPosting::with('creator');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $postings = $query->where('is_active', true)
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => JobPostingResource::collection($postings),
            'meta' => [
                'current_page' => $postings->currentPage(),
                'last_page' => $postings->lastPage(),
                'per_page' => $postings->perPage(),
                'total' => $postings->total(),
            ],
        ]);
    }

    public function store(StoreJobPostingRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('job-postings', 'public');
        }

        $posting = JobPosting::create($data);
        $posting->load('creator');

        return response()->json([
            'message' => 'Job posting created successfully.',
            'data' => new JobPostingResource($posting),
        ], 201);
    }

    public function show(JobPosting $jobPosting): JsonResponse
    {
        $jobPosting->load('creator');

        return response()->json([
            'data' => new JobPostingResource($jobPosting),
        ]);
    }

    public function update(UpdateJobPostingRequest $request, JobPosting $jobPosting): JsonResponse
    {
        $data = $request->validated();
        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('job-postings', 'public');
        }

        $jobPosting->update($data);
        $jobPosting->load('creator');

        return response()->json([
            'message' => 'Job posting updated successfully.',
            'data' => new JobPostingResource($jobPosting),
        ]);
    }

    public function destroy(JobPosting $jobPosting): JsonResponse
    {
        $jobPosting->delete();

        return response()->json([
            'message' => 'Job posting deleted successfully.',
        ]);
    }
}
