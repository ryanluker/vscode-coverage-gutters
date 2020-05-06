<?php

use test\main as myClass;
use test\secondmain as secondMain;
use PHPUnit\Framework\TestCase;

class mainTest extends TestCase
{
	public function testCanBeNegated () {
		$a = new myClass();
		$a->increase(9)->increase(8);
		$b = $a->negate();
		$this->assertEquals(0, $b->myParam);
	}

	public function testSecondMain () {
		$b = new secondMain();
		$b->increaseCovered(9)->increaseCovered(8);
		$this->assertEquals(17, $b->myParam);
	}
}
