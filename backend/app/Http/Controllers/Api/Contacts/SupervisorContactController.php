<?php

namespace App\Http\Controllers\Api\Contacts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contacts\StoreContactRequest;
use App\Http\Requests\Contacts\ReplyContactRequest;
use App\Http\Resources\SupervisorContactResource;
use App\Models\SupervisorContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisorContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SupervisorContact::with(['user', 'supervisor', 'internship']);

        $user = $request->user();
        $roleSlug = $user->role?->slug;

        if ($roleSlug === 'intern') {
            $query->where('user_id', $user->id);
        } elseif ($roleSlug === 'tutor') {
            $query->whereHas('user', fn ($q) => $q->where('tutor_id', $user->id));
        } elseif ($roleSlug === 'supervisor') {
            $query->where('supervisor_id', $user->id);
        }

        $contacts = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json([
            'data' => SupervisorContactResource::collection($contacts),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total(),
            ],
        ]);
    }

    public function store(StoreContactRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $contact = SupervisorContact::create($data);
        $contact->load(['user', 'supervisor', 'internship']);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => new SupervisorContactResource($contact),
        ], 201);
    }

    public function show(SupervisorContact $contact): JsonResponse
    {
        $contact->load(['user', 'supervisor', 'internship']);

        if (!$contact->is_read) {
            $contact->update(['is_read' => true]);
        }

        return response()->json([
            'data' => new SupervisorContactResource($contact),
        ]);
    }

    public function reply(ReplyContactRequest $request, SupervisorContact $contact): JsonResponse
    {
        $contact->update([
            'reply' => $request->validated('reply'),
            'replied_at' => now(),
        ]);

        $contact->load(['user', 'supervisor', 'internship']);

        return response()->json([
            'message' => 'Reply sent successfully.',
            'data' => new SupervisorContactResource($contact),
        ]);
    }
}
