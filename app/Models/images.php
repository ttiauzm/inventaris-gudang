<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class images extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'image_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'file_type',
        'file_size',
        'file_path',
        'item_id',
    ];

    public function item () {
        return $this->belongsTo(Item::class, 'item_id');
        
    }



}
