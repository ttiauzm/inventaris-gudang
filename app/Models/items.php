<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class items extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'items_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'item_name',
        'category_id',
        'material_id',
        'quantity',
        'unit',
        'price',
        'is_deleted', 
        'parent_item_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    public function images () {
        return $this->hasMany(ItemImage::class, 'item_id');
        
    }

    public function supplier () {
        return $this->belongsToMany(Supplier::class, 'supplier_id', 'item_id', 'supplier_id');
        
    }

}
