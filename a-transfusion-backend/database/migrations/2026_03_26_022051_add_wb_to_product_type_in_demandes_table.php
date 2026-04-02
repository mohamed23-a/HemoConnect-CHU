<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE `demandes` MODIFY COLUMN `product_type` ENUM('RBC', 'WBC', 'Plasma', 'WB') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE `demandes` SET `product_type` = 'RBC' WHERE `product_type` = 'WB'");
        DB::statement("ALTER TABLE `demandes` MODIFY COLUMN `product_type` ENUM('RBC', 'WBC', 'Plasma') NOT NULL");
    }
};
