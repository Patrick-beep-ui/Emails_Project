<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class TestCommand extends Command
{
    // The name and signature of the command
    protected $signature = 'test:fetch';

    // The console command description
    protected $description = 'Fetch latest news articles';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        // Example: create a new user
        $user = User::create([
            'first_name' => 'Test',
            'last_name'  => 'User',
            'email'      => 'testuser' . time() . '@example.com', // unique email
            'password'   => bcrypt('password123'), // hashed password
            'role'       => 'user', // adjust if your app uses different roles
        ]);
    
        $this->info('User created successfully! ID: ' . $user->user_id);
    }
    
}
