<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, HasRoles, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'user_type',
        'is_active',
        'profile_avatar_url',
        'cover_image_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function customerProfile()
    {
        return $this->hasOne(CustomerProfile::class);
    }

    public function deliveryAddresses()
    {
        return $this->hasMany(DeliveryAddress::class);
    }

    public function salesTransactions()
    {
        return $this->hasMany(SalesTransaction::class, 'customer_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function widgetPreferences()
    {
        return $this->hasMany(UserWidgetPreference::class);
    }
}
