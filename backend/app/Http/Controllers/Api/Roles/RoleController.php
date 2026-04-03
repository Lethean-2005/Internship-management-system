<?php

namespace App\Http\Controllers\Api\Roles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')->get();

        return response()->json([
            'data' => RoleResource::collection($roles),
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create($request->validated());

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => new RoleResource($role),
        ], 201);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update($request->validated());

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => new RoleResource($role),
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Cannot delete role that has assigned users.',
            ], 422);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully.',
        ]);
    }
}
