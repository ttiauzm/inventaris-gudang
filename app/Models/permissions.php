<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Permissions extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'permission_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'role_id',
        'permission_name',
        'is_deleted',
    ];

    public function role()
    {
        return $this->belongsTo(Roles::class, 'role_id');
    }
    
    
}
