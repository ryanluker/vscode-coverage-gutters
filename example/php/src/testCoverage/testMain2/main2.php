<?php

namespace test;

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
