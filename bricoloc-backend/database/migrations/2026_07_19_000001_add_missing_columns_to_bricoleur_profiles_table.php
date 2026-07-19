<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bricoleur_profiles', function (Blueprint $table) {
            $table->decimal('average_rating', 3, 1)->nullable()->after('total_jobs_completed');
            $table->integer('total_reviews')->default(0)->after('average_rating');
            $table->boolean('available_for_hire')->default(true)->after('total_reviews');
            $table->string('id_card_photo_path')->nullable()->after('available_for_hire');
            $table->string('selfie_with_id_path')->nullable()->after('id_card_photo_path');
            $table->foreignId('verified_by')->nullable()->after('selfie_with_id_path')->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable()->after('verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('bricoleur_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'average_rating',
                'total_reviews',
                'available_for_hire',
                'id_card_photo_path',
                'selfie_with_id_path',
                'verified_by',
                'rejection_reason',
            ]);
        });
    }
};
