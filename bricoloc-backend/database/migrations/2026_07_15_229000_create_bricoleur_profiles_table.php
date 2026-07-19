<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bricoleur_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('verification_status')->default('pending'); // pending, verified, rejected
            $table->timestamp('verified_at')->nullable();
            $table->integer('total_jobs_completed')->default(0);
            $table->text('skills')->nullable(); // JSON array of skill names
            $table->text('description')->nullable();
            $table->integer('years_of_experience')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bricoleur_profiles');
    }
};
