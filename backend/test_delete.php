<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();
    $user = User::latest()->first();
    echo 'Trying to delete User ID: '.$user->id.' ('.$user->email.")\n";
    $user->delete();
    echo "SUCCESS\n";
    DB::rollBack();
} catch (Exception $e) {
    DB::rollBack();
    echo 'ERROR: '.$e->getMessage()."\n";
}
