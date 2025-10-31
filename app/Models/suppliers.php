<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Suppliers extends Model
{
    use HasUuids, HasFactory;

    // pakai kolom primary key yang benar
    protected $primaryKey = 'supplier_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'supplier_name',
        'contact_info',
        'street',
        'city',
        'province',
        'postal_code',
        'country',
        'is_deleted',
    ];

    public function items()
    {
        return $this->belongsToMany(
            Items::class,
            'item_supplier',
            'supplier_id',
            'item_id'
        );
    }

    public function transactions() {
        return $this->hasMany(Transaction::class, 'supplier_id');
    }
}
