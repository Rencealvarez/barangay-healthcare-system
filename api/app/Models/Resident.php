<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resident extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'resident_id',
        'full_name',
        'gender',
        'date_of_birth',
        'civil_status',
        'purok_zone',
        'address',
        'contact_number',
        'email',
        'id_type',
        'id_number',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    /**
     * Get the user that owns the resident profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
