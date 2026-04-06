<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worklog_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('weekly_worklog_id')->constrained('weekly_worklogs')->cascadeOnDelete();
            $table->date('entry_date');
            $table->enum('time_slot', ['morning', 'afternoon']);
            $table->text('activities')->nullable();
            $table->text('difficulties')->nullable();
            $table->text('solutions')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        // Add new fields to weekly_worklogs for tutor topics and reflections
        Schema::table('weekly_worklogs', function (Blueprint $table) {
            $table->text('tutor_topics')->nullable()->after('plans_next_week');
            $table->text('reflections')->nullable()->after('tutor_topics');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worklog_entries');

        Schema::table('weekly_worklogs', function (Blueprint $table) {
            $table->dropColumn(['tutor_topics', 'reflections']);
        });
    }
};
