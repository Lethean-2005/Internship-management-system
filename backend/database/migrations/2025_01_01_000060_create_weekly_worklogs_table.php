<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_worklogs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('internship_id')->constrained('internships')->cascadeOnDelete();
            $table->integer('week_number');
            $table->date('start_date');
            $table->date('end_date');
            $table->text('tasks_completed');
            $table->text('challenges')->nullable();
            $table->text('plans_next_week')->nullable();
            $table->decimal('hours_worked', 5, 1)->default(0);
            $table->string('status')->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('feedback')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_worklogs');
    }
};
