<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $roleSlug = $request->validated('role') ?? 'intern';
        $role = Role::where('slug', $roleSlug)->first();

        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
            'phone' => $request->validated('phone'),
            'department' => $request->validated('department'),
            'company_name' => $request->validated('company_name'),
            'position' => $request->validated('position'),
            'tutor_id' => $request->validated('tutor_id'),
            'supervisor_name' => $request->validated('supervisor_name'),
            'role_id' => $role?->id,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;
        $user->load('role');

        return response()->json([
            'message' => 'Registration successful.',
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->validated())) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;
        $user->load('role');

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('role');

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }
}
