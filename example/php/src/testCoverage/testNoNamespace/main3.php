<?php

class NonNamespaced
{
	private $numberedProperty = 0;
	
	public function __construct()
	{
		$this->numberedProperty++;
	}
	
	public function covered(): int
	{
		return $this->numberedProperty++;
	}

	public function notCovered(): int
	{
		return $this->numberedProperty--;
	}
}
