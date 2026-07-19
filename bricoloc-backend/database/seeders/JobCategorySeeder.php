<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Plomberie', 'name_en' => 'Plumbing', 'icon' => 'wrench'],
            ['name' => 'Électricité', 'name_en' => 'Electrical', 'icon' => 'zap'],
            ['name' => 'Peinture', 'name_en' => 'Painting', 'icon' => 'paintbrush'],
            ['name' => 'Menuiserie', 'name_en' => 'Carpentry', 'icon' => 'hammer'],
            ['name' => 'Climatisation', 'name_en' => 'AC Repair', 'icon' => 'snowflake'],
            ['name' => 'Ménage', 'name_en' => 'Cleaning', 'icon' => 'sparkles'],
            ['name' => 'Déménagement', 'name_en' => 'Moving', 'icon' => 'truck'],
            ['name' => 'Réparation', 'name_en' => 'Repair', 'icon' => 'tool'],
        ];

        foreach ($categories as $category) {
            DB::table('job_categories')->updateOrInsert(
                ['name' => $category['name']],
                array_merge($category, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
