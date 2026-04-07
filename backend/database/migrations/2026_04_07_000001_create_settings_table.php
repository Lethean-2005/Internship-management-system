<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) return;
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed default settings
        $defaults = [
            ['key' => 'app_name', 'value' => 'Internship Management System'],
            ['key' => 'app_timezone', 'value' => 'UTC'],
            ['key' => 'max_interns_per_tutor', 'value' => '10'],
            ['key' => 'worklog_submission_day', 'value' => 'friday'],
            ['key' => 'maintenance_mode', 'value' => '0'],
            ['key' => 'allow_registration', 'value' => '1'],
        ];

        foreach ($defaults as $setting) {
            DB::table('settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
