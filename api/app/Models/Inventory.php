<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;

    protected $table = 'inventory';

    protected $fillable = [
        'item_name',
        'sku',
        'category',
        'quantity',
        'unit',
        'min_stock_level',
        'expiration_date',
        'status',
    ];

    protected $casts = [
        'expiration_date' => 'date',
        'quantity'        => 'integer',
        'min_stock_level' => 'integer',
    ];
}
