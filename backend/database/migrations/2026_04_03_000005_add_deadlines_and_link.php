<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('final_slides', function (Blueprint $table) {
            $table->string('slide_link')->nullable();
            $table->date('deadline')->nullable();
        });

        Schema::table('final_reports', function (Blueprint $table) {
            $table->date('deadline')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('final_slides', function (Blueprint $table) {
            $table->dropColumn(['slide_link', 'deadline']);
        });

        Schema::table('final_reports', function (Blueprint $table) {
            $table->dropColumn('deadline');
        });
    }
};
