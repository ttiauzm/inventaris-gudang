<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transactions extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'transaction_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'item_id',
        'user_id',
        'supplier_id',
        'transaction_type',
        'quantity',
        'unit',
        'description',
        'image_proof',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function item() {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function supplier() {
        return $this->belongsTo(Suppliers::class, 'supplier_id');
    }
}