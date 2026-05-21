<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $table = 'tbl_products';
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'name',
        'price',
        'description',
        'photo',
        'is_deleted',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'product_id', 'product_id');
    }
}
