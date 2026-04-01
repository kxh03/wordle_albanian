<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
        ]);

        return response()->json([
            'token' => $user->createToken('api-token')->plainTextToken,
            'user' => $user,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email'))->first();
        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            throw ValidationException::withMessages(['email' => ['Invalid credentials.']]);
        }

        return response()->json([
            'token' => $user->createToken($request->input('device_name', 'api-token'))->plainTextToken,
            'user' => $user,
        ]);
    }

    public function logout(): JsonResponse
    {
        auth()->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }
}
