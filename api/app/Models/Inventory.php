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
        'code',
        'category',
        'quantity',
        'unit',
        'min_stock_level',
        'expiration_date',
        'status',
        'last_restocked',
    ];

    protected $casts = [
        'expiration_date' => 'date',
        'last_restocked'  => 'date',
        'quantity'        => 'integer',
        'min_stock_level' => 'integer',
    ];

    /**
     * Auto-calculate stock status based on stock quantity.
     * In Stock if qty > 20, Low Stock if 1-20, Out of Stock if 0 (or less).
     */
    public static function calculateStatus(int $quantity): string
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        } elseif ($quantity <= 20) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }

    public static function formatStatus(string $rawStatus): string
    {
        $normalized = strtolower(str_replace(' ', '_', $rawStatus));
        return match ($normalized) {
            'out_of_stock' => 'Out of Stock',
            'low_stock'    => 'Low Stock',
            'in_stock'     => 'In Stock',
            default        => 'In Stock',
        };
    }

    protected static function booted(): void
    {
        static::saving(function ($inventory) {
            $inventory->status = self::calculateStatus((int) $inventory->quantity);
        });
    }
}
