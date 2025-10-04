<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class materials extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'material_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'material_name',
        'description',
        'is_deleted',
    ];

    public function items () {
        return $this->hasMany(Item::class, 'material_id', 'material_id');
        
    }

}
