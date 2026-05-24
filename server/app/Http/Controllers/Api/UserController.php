<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function profileUrl(?string $photo): ?string
    {
        return $photo ? url('storage/public/img/user/profile_picture/' . $photo) : null;
    }

    public function loadUsers(Request $request)
    {
        $search = $request->input('search');

        $users = User::with('role')
            ->where('is_deleted', false)
            ->orderByDesc('created_at');

        if ($search) {
            $users->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhereHas('role', fn ($r) => $r->where('name', 'like', "%{$search}%"));
            });
        }

        $users = $users->paginate(5);

        $users->getCollection()->transform(function ($user) {
            $user->profile_picture = $this->profileUrl($user->profile_picture);

            return $user;
        });

        return response()->json(['users' => $users], 200);
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'profile_picture' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'name' => ['required', 'max:120'],
            'username' => ['required', 'min:6', 'max:55', Rule::unique('tbl_users', 'username')],
            'role' => ['required', 'exists:tbl_roles,role_id'],
            'password' => ['required', 'min:6', 'max:55', 'confirmed'],
            'password_confirmation' => ['required', 'min:6', 'max:55'],
        ]);

        $filenameToStore = null;
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $filenameToStore = sha1($filename . '_' . time()) . '.' . $extension;
            $file->storeAs('public/img/user/profile_picture', $filenameToStore);
        }

        $user = User::create([
            'profile_picture' => $filenameToStore,
            'name' => $validated['name'],
            'role_id' => $validated['role'],
            'username' => $validated['username'],
            'password' => $validated['password'],
        ]);

        ActivityLogService::recordFromRequest($request, "added user \"{$user->name}\"");

        return response()->json(['message' => 'User Successfully Saved'], 200);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'profile_picture' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'name' => ['required', 'max:120'],
            'username' => ['required', 'min:6', 'max:55', Rule::unique('tbl_users', 'username')->ignore($user)],
            'role' => ['required', 'exists:tbl_roles,role_id'],
            'password' => ['nullable', 'min:6', 'max:55', 'confirmed'],
            'password_confirmation' => ['nullable', 'min:6', 'max:55'],
        ]);

        $profilePicture = $user->profile_picture;

        if ($request->has('remove_profile_picture') && $request->remove_profile_picture == '1') {
            if ($profilePicture) {
                Storage::delete('public/img/user/profile_picture/' . $profilePicture);
            }
            $profilePicture = null;
        } elseif ($request->hasFile('profile_picture')) {
            if ($profilePicture) {
                Storage::delete('public/img/user/profile_picture/' . $profilePicture);
            }
            $file = $request->file('profile_picture');
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $profilePicture = sha1($filename . '_' . time()) . '.' . $extension;
            $file->storeAs('public/img/user/profile_picture', $profilePicture);
        }

        $data = [
            'profile_picture' => $profilePicture,
            'name' => $validated['name'],
            'role_id' => $validated['role'],
            'username' => $validated['username'],
        ];

        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }

        $user->update($data);

        ActivityLogService::recordFromRequest($request, "updated user \"{$user->name}\"");

        $user->refresh()->load('role');
        $user->profile_picture = $this->profileUrl($user->profile_picture);

        return response()->json([
            'message' => 'User Successfully Updated',
            'user' => $user,
        ], 200);
    }

    public function destroyUser(Request $request, User $user)
    {
        $user->update(['is_deleted' => true]);

        ActivityLogService::recordFromRequest($request, "deleted user \"{$user->name}\"");

        return response()->json(['message' => 'User Successfully Deleted.'], 200);
    }
}
