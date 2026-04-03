<?php

namespace App\Http\Controllers\Api\Companies;

use App\Http\Controllers\Controller;
use App\Http\Requests\Companies\StoreCompanyRequest;
use App\Http\Requests\Companies\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Company::withCount('internships');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('industry', 'like', "%{$search}%");
            });
        }

        if ($request->filled('industry')) {
            $query->where('industry', $request->input('industry'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $companies = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => CompanyResource::collection($companies),
            'meta' => [
                'current_page' => $companies->currentPage(),
                'last_page' => $companies->lastPage(),
                'per_page' => $companies->perPage(),
                'total' => $companies->total(),
            ],
        ]);
    }

    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $company = Company::create($request->validated());

        return response()->json([
            'message' => 'Company created successfully.',
            'data' => new CompanyResource($company),
        ], 201);
    }

    public function show(Company $company): JsonResponse
    {
        $company->loadCount('internships');

        return response()->json([
            'data' => new CompanyResource($company),
        ]);
    }

    public function update(UpdateCompanyRequest $request, Company $company): JsonResponse
    {
        $company->update($request->validated());

        return response()->json([
            'message' => 'Company updated successfully.',
            'data' => new CompanyResource($company),
        ]);
    }

    public function destroy(Company $company): JsonResponse
    {
        $company->delete();

        return response()->json([
            'message' => 'Company deleted successfully.',
        ]);
    }
}
