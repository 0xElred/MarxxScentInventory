<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function loadRoles()
    {
        $roles = Role::where('is_deleted', false)->orderBy('name')->get();

        return response()->json(['roles' => $roles], 200);
    }

    public function getRole(Role $role)
    {
        return response()->json(['role' => $role], 200);
    }

    public function storeRole(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'max:55',
                Rule::unique('tbl_roles', 'name')->where(fn ($query) => $query->where('is_deleted', false)),
            ],
        ]);

        $role = Role::create(['name' => strtolower($validated['name'])]);

        ActivityLogService::recordFromRequest($request, "added role \"{$role->name}\"");

        return response()->json([
            'message' => 'Role Successfully Saved',
            'role' => $role,
        ], 200);
    }

    public function updateRole(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'max:55',
                Rule::unique('tbl_roles', 'name')
                    ->ignore($role->role_id, 'role_id')
                    ->where(fn ($query) => $query->where('is_deleted', false)),
            ],
        ]);

        $role->update(['name' => strtolower($validated['name'])]);

        ActivityLogService::recordFromRequest($request, "updated role \"{$role->name}\"");

        return response()->json([
            'message' => 'Role Successfully Updated',
            'role' => $role,
        ], 200);
    }

    public function destroyRole(Request $request, Role $role)
    {
        if ($role->users()->where('is_deleted', false)->exists()) {
            return response()->json([
                'message' => 'Cannot delete role that is assigned to users.',
            ], 422);
        }

        $role->update(['is_deleted' => true]);

        ActivityLogService::recordFromRequest($request, "deleted role \"{$role->name}\"");

        return response()->json(['message' => 'Role Successfully Deleted.'], 200);
    }
}
