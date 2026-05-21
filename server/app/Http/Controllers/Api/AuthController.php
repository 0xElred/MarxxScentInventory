<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    private function profileUrl(?string $photo): ?string
    {
        return $photo ? url('storage/public/img/user/profile_picture/' . $photo) : null;
    }

    private function formatUser(User $user): User
    {
        $user->load('role');
        $user->profile_picture = $this->profileUrl($user->profile_picture);

        return $user;
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'min:6', 'max:55'],
            'password' => ['required', 'min:6', 'max:55'],
        ]);

        $user = User::with('role')
            ->where('username', $validated['username'])
            ->where('is_deleted', false)
            ->first();

        if (! $user || ! Auth::attempt(['username' => $validated['username'], 'password' => $validated['password']])) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        ActivityLogService::record($user, 'logged in');

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        ActivityLogService::record($user, 'logged out');
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged Out Successfully',
        ], 200);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ], 200);
    }
}
