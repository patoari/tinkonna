<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;

class DashboardWidget extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'component_name', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_dashboard_widgets')
            ->withPivot('sort_order', 'widget_settings')
            ->withTimestamps();
    }
}
