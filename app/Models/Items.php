<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Categories;
use App\Models\Materials;
use App\Models\Images;
use App\Models\Suppliers;

class Items extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'item_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'item_id',
        'item_name',
        'category_id',
        'material_id',
        'quantity',
        'unit',
        'price',
        'is_deleted', 
        'parent_item_id',
    ];

    public function categories()
    {
        return $this->belongsTo(Categories::class, 'category_id');
    }

    public function materials()
    {
        return $this->belongsTo(Materials::class, 'material_id');
    }

    public function images () {
        return $this->hasMany(Images::class, 'item_id');
        
    }

    public function suppliers()
    {
        return $this->belongsToMany(
            Suppliers::class,      // Model tujuan
            'item_supplier',      // Nama tabel pivot
            'item_id',            // Foreign key di tabel pivot untuk Item
            'supplier_id'         // Foreign key di tabel pivot untuk Supplier
        );
    }


}
