<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $table = 'tbl_orders';
    protected $primaryKey = 'order_id';

    protected $fillable = [
        'order_code',
        'product_id',
        'receiver_name',
        'address',
        'status',
        'total_amount',
        'is_deleted',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
