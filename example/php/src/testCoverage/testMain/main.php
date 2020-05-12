<?php

namespace test;

class main {

	public $myParam = 0;

	public function increase ( $n ) {
		$this->myParam += $n;
		return $this;
	}

	public function negate (){
		$this->myParam = 0;
		return $this;
	}

	public function notcovered (){
		$this->myParam = 0;
		return $this;
	}
}
