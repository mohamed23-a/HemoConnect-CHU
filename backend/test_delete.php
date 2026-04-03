<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;

try {
    DB::beginTransaction();
    $user = User::latest()->first();
    echo "Trying to delete User ID: " . $user->id . " (" . $user->email . ")\n";
    $user->delete();
    echo "SUCCESS\n";
    DB::rollBack();
} catch (\Exception $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
}
