<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Logs extends Model
{
    use HasUuids, HasFactory;

    protected $primaryKey = 'log_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'action',
        'table_name',
        'row_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    


    
}
