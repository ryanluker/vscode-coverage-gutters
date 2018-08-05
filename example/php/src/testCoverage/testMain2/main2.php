<?php

namespace test;

require(dirname(dirname(dirname(dirname(__FILE__)))) . '/vendor/autoload.php');

class secondmain {

	public $myParam = 0;

	public function increaseCovered ( $n ) {
		$this->myParam += $n;
		return $this;
	}

	public function notcovered (){
		$this->myParam = 0;
		return $this;
	}

	public function negate (){
		$this->myParam = 0;
		$this->myParam = 0;
		$this->myParam = 0;
		return $this;
	}
}
