<?php

namespace Database\Seeders;

use App\Models\Todo;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create some sample todos
        Todo::factory()->count(5)->create();

        // Create a completed todo
        Todo::factory()->completed()->create([
            'title' => 'Completed Task Example',
        ]);

        // Create an important todo
        Todo::factory()->create([
            'title' => 'Important Task Example',
            'description' => 'This is a high-priority task that needs attention',
        ]);
    }
}
