<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transfusions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained()->unique()->onDelete('cascade');
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
            $table->integer('quantity');
            $table->foreignId('processed_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('processed_at')->useCurrent();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('processed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfusions');
    }
};