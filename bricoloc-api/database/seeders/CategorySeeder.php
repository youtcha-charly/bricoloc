<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Plomberie', 'icon' => '🔧'],
            ['name' => 'Electricite', 'icon' => '⚡'],
            ['name' => 'Peinture', 'icon' => '🎨'],
            ['name' => 'Menuiserie', 'icon' => '🪚'],
            ['name' => 'Climatisation', 'icon' => '❄️'],
            ['name' => 'Menage', 'icon' => '🧹'],
            ['name' => 'Jardinage', 'icon' => '🌿'],
            ['name' => 'Demenagement', 'icon' => '📦'],
        ];

        DB::table('job_categories')->insert($categories);
    }
}