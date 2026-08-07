<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffCredential extends Model
{
    use HasFactory;

    protected $table = 'staff_credentials';

    protected $fillable = [
        'user_id',
        'employee_id',
        'full_name',
        'username',
        'email',
        'password',
        'role',
        'position',
        'department',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'last_login_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
