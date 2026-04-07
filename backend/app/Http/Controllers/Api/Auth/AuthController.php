<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Mail\VerificationCodeMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $roleSlug = $request->validated('role') ?? 'intern';
        $role = Role::where('slug', $roleSlug)->first();

        $code = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

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
            'generation' => $request->validated('generation'),
            'role_id' => $role?->id,
            'verification_code' => $code,
            'verification_code_sent_at' => now(),
        ]);

        try {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $user->name));
        } catch (\Exception $e) {
            \Log::warning('Failed to send verification email: ' . $e->getMessage());
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        $user->load('role');

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
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

    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:4'],
        ]);

        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if (!$user->verification_code) {
            // No code exists — auto-verify (user registered before this feature)
            $user->update(['email_verified_at' => now()]);
            return response()->json(['message' => 'Email verified successfully.']);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        // Check if code expired (5 minutes)
        if ($user->verification_code_sent_at && $user->verification_code_sent_at->diffInSeconds(now()) > 300) {
            return response()->json(['message' => 'Verification code has expired. Please request a new one.'], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_sent_at' => null,
        ]);

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function resendCode(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.']);
        }

        // Rate limit: 10 seconds between resends
        if ($user->verification_code_sent_at && $user->verification_code_sent_at->diffInSeconds(now()) < 10) {
            $wait = 10 - $user->verification_code_sent_at->diffInSeconds(now());
            return response()->json(['message' => "Please wait {$wait} seconds before requesting a new code."], 429);
        }

        $code = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        $user->update([
            'verification_code' => $code,
            'verification_code_sent_at' => now(),
        ]);

        try {
            Mail::to($user->email)->send(new VerificationCodeMail($code, $user->name));
        } catch (\Exception $e) {
            \Log::warning('Failed to send verification email: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send email. Please try again.'], 500);
        }

        return response()->json(['message' => 'Verification code sent.']);
    }
}
