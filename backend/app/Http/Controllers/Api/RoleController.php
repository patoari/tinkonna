<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        if ($request->permissions) {
            foreach ($request->permissions as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            }
            $role->syncPermissions($request->permissions);
        }

        return response()->json($role->load('permissions'), 201);
    }

    public function show(Role $role)
    {
        return response()->json($role->load('permissions'));
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'nullable|array',
        ]);

        if (!in_array($role->name, ['admin', 'customer'])) {
            $role->update(['name' => $request->name]);
        }

        if ($request->has('permissions')) {
            foreach ($request->permissions as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            }
            $role->syncPermissions($request->permissions);
        }

        return response()->json($role->load('permissions'));
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, ['admin', 'customer'])) {
            return response()->json(['message' => 'Cannot delete default roles'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted']);
    }
}
