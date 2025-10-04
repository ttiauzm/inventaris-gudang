<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class item_supplier extends Model
{
    use HasUuids;

    protected $table = 'item_supplier';

    protected $fillable = [
        'item_id',
        'supplier_id',
    ];
}
