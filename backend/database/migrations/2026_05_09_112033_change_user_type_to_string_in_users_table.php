<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change user_type from ENUM to VARCHAR so custom role names can be stored
        DB::statement("ALTER TABLE users MODIFY user_type VARCHAR(50) NOT NULL DEFAULT 'customer'");

        // Sync existing non-customer users: set user_type to their first Spatie role name
        DB::statement("
            UPDATE users u
            JOIN model_has_roles mhr ON mhr.model_id = u.id AND mhr.model_type = 'App\\\\Models\\\\User'
            JOIN roles r ON r.id = mhr.role_id
            SET u.user_type = r.name
            WHERE u.user_type != 'customer'
        ");
    }

    public function down(): void
    {
        // Revert back to ENUM (map any unknown values back to 'staff')
        DB::statement("UPDATE users SET user_type = 'staff' WHERE user_type NOT IN ('admin','staff','customer')");
        DB::statement("ALTER TABLE users MODIFY user_type ENUM('admin','staff','customer') NOT NULL DEFAULT 'customer'");
    }
};
