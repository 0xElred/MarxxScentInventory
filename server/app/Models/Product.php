<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $table = 'tbl_products';
    protected $primaryKey = 'product_id';

    public const VARIANT_BOTTLE = 'bottle';
    public const VARIANT_5ML = '5ml';
    public const VARIANT_10ML = '10ml';

    protected $fillable = [
        'name',
        'price',
        'bottles',
        'stock_5ml',
        'stock_10ml',
        'description',
        'photo',
        'is_deleted',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'bottles' => 'integer',
            'stock_5ml' => 'integer',
            'stock_10ml' => 'integer',
        ];
    }

    public static function validVariants(): array
    {
        return [self::VARIANT_BOTTLE, self::VARIANT_5ML, self::VARIANT_10ML];
    }

    public function unitPriceForVariant(string $variant): float
    {
        $bottlePrice = (float) $this->price;

        return match ($variant) {
            self::VARIANT_BOTTLE => $bottlePrice,
            self::VARIANT_5ML => $bottlePrice / 20,
            self::VARIANT_10ML => $bottlePrice / 10,
            default => $bottlePrice,
        };
    }

    public function stockForVariant(string $variant): int
    {
        return match ($variant) {
            self::VARIANT_BOTTLE => (int) $this->bottles,
            self::VARIANT_5ML => (int) $this->stock_5ml,
            self::VARIANT_10ML => (int) $this->stock_10ml,
            default => 0,
        };
    }

    public function variantLabel(string $variant): string
    {
        return match ($variant) {
            self::VARIANT_BOTTLE => 'Bottle',
            self::VARIANT_5ML => '5ML',
            self::VARIANT_10ML => '10ML',
            default => $variant,
        };
    }

    public function decrementVariantStock(string $variant, int $quantity): void
    {
        match ($variant) {
            self::VARIANT_BOTTLE => $this->decrement('bottles', $quantity),
            self::VARIANT_5ML => $this->decrement('stock_5ml', $quantity),
            self::VARIANT_10ML => $this->decrement('stock_10ml', $quantity),
            default => null,
        };
    }

    public function incrementVariantStock(string $variant, int $quantity): void
    {
        match ($variant) {
            self::VARIANT_BOTTLE => $this->increment('bottles', $quantity),
            self::VARIANT_5ML => $this->increment('stock_5ml', $quantity),
            self::VARIANT_10ML => $this->increment('stock_10ml', $quantity),
            default => null,
        };
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'product_id');
    }
}
