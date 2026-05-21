<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogService
{
    public static function resolveUser(?User $user = null): ?User
    {
        if ($user) {
            return $user;
        }

        return User::where('username', 'carlmarvin')
            ->where('is_deleted', false)
            ->first();
    }

    public static function record(?User $user, string $activity, ?string $userName = null): void
    {
        $actor = self::resolveUser($user);

        ActivityLog::create([
            'user_id' => $actor?->user_id,
            'user_name' => $userName ?? $actor?->name ?? 'Unknown User',
            'activity' => $activity,
        ]);
    }

    public static function recordFromRequest(Request $request, string $activity): void
    {
        self::record($request->user(), $activity);
    }
}
