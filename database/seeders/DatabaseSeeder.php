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
        // Create default users as mentioned in README
        $regularUser = User::factory()->create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
        ]);

        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create some sample todos for the regular user
        Todo::factory()->count(3)->create([
            'user_id' => $regularUser->id,
        ]);

        // Create a completed todo for the regular user
        Todo::factory()->completed()->create([
            'user_id' => $regularUser->id,
            'title' => 'Completed Task Example',
            'description' => 'This task has been completed successfully',
        ]);

        // Create an important todo for the regular user
        Todo::factory()->create([
            'user_id' => $regularUser->id,
            'title' => 'Important Task Example',
            'description' => 'This is a high-priority task that needs attention',
        ]);

        // Create some todos for the admin user
        Todo::factory()->count(2)->create([
            'user_id' => $adminUser->id,
        ]);
    }
}
