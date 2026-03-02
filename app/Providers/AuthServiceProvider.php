<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema; // ✅ Tambahan facade Schema di sini
use App\Models\Permissions;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // ✅ Superadmin bypass semua permission
        Gate::before(function ($user, $ability) {
            if ($user->role && $user->role->role_name === 'superadmin') {
                return true;
            }
        });

        // ✅ Cek dulu tabelnya ada atau nggak biar nggak error pas migrate database kosong
        if (Schema::hasTable('permissions')) { 
            $permissions = Permissions::where('is_deleted', false)
                ->pluck('permission_name')
                ->unique();

            foreach ($permissions as $permission) {
                Gate::define($permission, function ($user) use ($permission) {
                    return $user->hasPermission($permission);
                });
            }
        }
    }
}