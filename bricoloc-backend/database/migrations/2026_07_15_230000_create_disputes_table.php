<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * NOTE: no controller for *creating* disputes was included in what
     * I reviewed — AdminController only lists and resolves them. These
     * columns cover what AdminController touches (status, resolution,
     * resolved_at) plus reasonable context fields (job_id, raised_by_id,
     * reason). Adjust if your actual dispute-creation flow differs.
     */
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->nullable()->constrained('job_postings')->nullOnDelete();
            $table->foreignId('raised_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->string('status')->default('open'); // open, resolved
            $table->text('resolution')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
