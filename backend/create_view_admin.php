<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::firstOrCreate(
    ['email' => 'view@admin.com'],
    [
        'name' => 'View Admin', 
        'password' => Hash::make('password'), 
        'role' => 'admin', 
        'is_super_admin' => false, 
        'is_active' => true
    ]
);

echo "View Admin user created successfully!\n";
