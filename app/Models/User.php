<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Models\Permissions;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasUuids, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';
    

    /**
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'role_id',
        'is_deleted',
        'email_pending'
    ];

    public function role() {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function logs() {
        return $this->hasMany(Log::class, 'user_id');
    }

    public function transaction(){
        return $this->hasMany(Transaction::class, 'user_id');
        
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'email_pending' => 'string',
        ];
    }

    public function hasPermission($permissionName) {
        $role = $this->role;
        if (!$role) return false;

        return Permissions::where('role_id', $role->role_id)
            ->where('permission_name', $permissionName)
            ->where('is_deleted', false)
            ->exists();
    }

    public function routeNotificationForMail($notification)
    {
        // Jika ada email_pending, kirim notifikasi ke sana. Jika tidak, kirim ke email utama.
        return $this->email_pending ?? $this->email;
    }

}
