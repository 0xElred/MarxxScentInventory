<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $table = 'tbl_orders';
    protected $primaryKey = 'order_id';

    protected $fillable = [
        'order_code',
        'receiver_name',
        'address',
        'status',
        'total_amount',
        'stock_deducted',
        'is_deleted',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'stock_deducted' => 'boolean',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }
}
