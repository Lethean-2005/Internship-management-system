<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['tutor', 'supervisor']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tutor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('supervisor_name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tutor_id']);
            $table->dropColumn(['tutor_id', 'supervisor_name']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('tutor')->nullable();
            $table->string('supervisor')->nullable();
        });
    }
};
