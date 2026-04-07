<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('worklog_entries')) return;
        Schema::create('worklog_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('weekly_worklog_id')->constrained('weekly_worklogs')->cascadeOnDelete();
            $table->date('entry_date');
            $table->string('time_slot')->default('morning');
            $table->text('activities')->nullable();
            $table->text('difficulties')->nullable();
            $table->text('solutions')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worklog_entries');
    }
};
