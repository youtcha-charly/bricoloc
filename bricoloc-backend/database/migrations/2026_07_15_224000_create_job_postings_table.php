<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Business "job postings" table. NOT named `jobs` — that name is
     * permanently taken by Laravel's internal queue system
     * (see 0001_01_01_000002_create_jobs_table.php). The Eloquent model
     * stays named `Job` for the controllers, but points at this table
     * via `protected $table = 'job_postings';`
     */
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('job_categories');
            $table->foreignId('hired_bricoleur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->integer('budget_min')->nullable();
            $table->integer('budget_max')->nullable();
            $table->string('budget_type')->default('fixed');
            $table->string('city');
            $table->string('status')->default('open'); // open, assigned, in_progress, completed
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
