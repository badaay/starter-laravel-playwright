<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class GenerateApiToken extends Command
{
    protected $signature = 'api:token {email? : The email of the user to generate a token for} {--create : Create a new user if the email doesn\'t exist}';
    protected $description = 'Generate an API token for a user';

    public function handle()
    {
        $email = $this->argument('email');

        if (!$email) {
            $email = $this->ask('What is the user\'s email?');
        }

        $user = User::where('email', $email)->first();

        if (!$user && $this->option('create')) {
            // Create a new user if the email doesn't exist
            $name = $this->ask('User not found. What name should the new user have?');
            $password = $this->secret('What password should the new user have?');

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]);

            $this->info("User {$name} created successfully.");
        } elseif (!$user) {
            $createUser = $this->confirm('User not found. Do you want to create a new user?');

            if ($createUser) {
                $name = $this->ask('What name should the new user have?');
                $password = $this->secret('What password should the new user have?');

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ]);

                $this->info("User {$name} created successfully.");
            } else {
                $this->error('No user found with that email.');
                return 1;
            }
        }

        // Revoke all existing tokens
        if ($this->confirm('Do you want to revoke all existing tokens for this user?', true)) {
            $user->tokens()->delete();
            $this->info('All existing tokens have been revoked.');
        }

        // Create a new token
        $tokenName = $this->ask('What should be the token name?', 'api-documentation');
        $token = $user->createToken($tokenName)->plainTextToken;

        $this->info('API token generated successfully!');
        $this->info('');
        $this->info('User: ' . $user->name . ' (' . $user->email . ')');
        $this->info('Token: ' . $token);
        $this->info('');
        $this->info('Use this token in the API documentation by including it in the Authorization header:');
        $this->info('Authorization: Bearer ' . $token);
        $this->info('');
        $this->info('You can also try this command in your terminal:');
        $this->info('curl -X GET ' . config('app.url') . '/api/todos -H "Accept: application/json" -H "Authorization: Bearer ' . $token . '"');

        return 0;
    }
}
