<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('company_name');
            $table->string('location')->nullable();
            $table->string('type')->default('internship'); // internship, full-time, part-time
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->text('benefits')->nullable();
            $table->string('department')->nullable();
            $table->integer('positions')->default(1);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('application_deadline')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('status')->default('open'); // open, closed
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
