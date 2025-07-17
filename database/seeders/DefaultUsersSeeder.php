<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Todo;
use Illuminate\Database\Seeder;

/**
 * Seeder for creating default users as mentioned in README.
 */
class DefaultUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        // Create default users as mentioned in README
        $regularUser = User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Regular User',
                'email' => 'user@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $adminUser = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create some sample todos for the regular user (only if they don't exist)
        if ($regularUser->todos()->count() == 0) {
            Todo::factory()->count(3)->create(
                [
                    'user_id' => $regularUser->id,
                ]
            );

            // Create a completed todo for the regular user
            Todo::factory()->completed()->create(
                [
                    'user_id' => $regularUser->id,
                    'title' => 'Completed Task Example',
                    'description' => 'This task has been completed successfully',
                ]
            );

            // Create an important todo for the regular user
            Todo::factory()->create(
                [
                    'user_id' => $regularUser->id,
                    'title' => 'Important Task Example',
                    'description' => 'This is a high-priority task that needs attention',
                ]
            );
        }

        // Create some todos for the admin user (only if they don't exist)
        if ($adminUser->todos()->count() == 0) {
            Todo::factory()->count(2)->create(
                [
                    'user_id' => $adminUser->id,
                ]
            );
        }

        $this->command->info('Default users created successfully!');
        $this->command->info('Regular User: user@example.com / password');
        $this->command->info('Admin User: admin@example.com / password');
    }
}
