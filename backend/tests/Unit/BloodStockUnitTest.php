<?php

namespace Tests\Unit;

use App\Models\BloodStock;
use PHPUnit\Framework\TestCase;

class BloodStockUnitTest extends TestCase
{
    public function test_is_low_returns_true_when_quantity_below_threshold()
    {
        $stock = new BloodStock;
        $stock->quantity = 4;
        $stock->minimum_threshold = 5;

        $this->assertTrue($stock->isLow());
    }

    public function test_is_low_returns_false_when_quantity_above_threshold()
    {
        $stock = new BloodStock;
        $stock->quantity = 10;
        $stock->minimum_threshold = 5;

        $this->assertFalse($stock->isLow());
    }

    public function test_has_enough_quantity()
    {
        $stock = new BloodStock;
        $stock->quantity = 10;

        $this->assertTrue($stock->hasEnoughQuantity(5));
        $this->assertTrue($stock->hasEnoughQuantity(10));
        $this->assertFalse($stock->hasEnoughQuantity(15));
    }
}
