<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('patients')) {
            Schema::table('patients', function (Blueprint $table) {
                if (!Schema::hasColumn('patients', 'purok_zone')) {
                    $table->string('purok_zone')->nullable()->after('address');
                }
            });
        }

        if (Schema::hasTable('inventory')) {
            Schema::table('inventory', function (Blueprint $table) {
                if (!Schema::hasColumn('inventory', 'code')) {
                    $table->string('code')->nullable()->after('id');
                }
                if (!Schema::hasColumn('inventory', 'last_restocked')) {
                    $table->date('last_restocked')->nullable()->after('status');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('patients')) {
            Schema::table('patients', function (Blueprint $table) {
                if (Schema::hasColumn('patients', 'purok_zone')) {
                    $table->dropColumn('purok_zone');
                }
            });
        }

        if (Schema::hasTable('inventory')) {
            Schema::table('inventory', function (Blueprint $table) {
                if (Schema::hasColumn('inventory', 'code')) {
                    $table->dropColumn('code');
                }
                if (Schema::hasColumn('inventory', 'last_restocked')) {
                    $table->dropColumn('last_restocked');
                }
            });
        }
    }
};
