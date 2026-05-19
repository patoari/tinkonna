<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserWidgetPreference extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'dashboard_widget_id', 'sort_order', 'is_collapsed', 'custom_settings'];

    protected $casts = [
        'sort_order' => 'integer',
        'is_collapsed' => 'boolean',
        'custom_settings' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function widget()
    {
        return $this->belongsTo(DashboardWidget::class, 'dashboard_widget_id');
    }
}
