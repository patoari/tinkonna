<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MobileBankingAccount extends Model
{
    use HasFactory;

    protected $fillable = ['provider', 'account_name', 'account_number', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
