<?php
/**
 * testCoverage
 * @package main
 * @version 0.1.0
 * @link https://github.com/test/testCoverage
 * @author test <https://github.com/test>
 * @license https://github.com/test/testCoverage/blob/master/LICENSE
 * @copyright Copyright (c) 2014, test
 */

namespace test;

require(dirname(dirname(dirname(dirname(__FILE__)))) . '/vendor/autoload.php');

/**
 * The main class
 * @author test <https://github.com/test>
 * @since 0.1.0
 */
class main {

	/**
	 * A sample parameter
	 * @var int $myParam This is my parameter
	 * @since 0.1.0
	 */
	public $myParam = 0;

	/**
	 * A sample function that adds the $n param to $myParam
	 * @name increase
	 * @param int $n The number to add to $myParam
	 * @since 0.1.0
	 * @return object the main object
	 */
	public function increase ( $n ) {
		$this->myParam += $n;
		return $this;
	}

	/**
	 * A sample function that sets $myParam to 0
	 * @name negate
	 * @since 0.1.0
	 * @return object the main object
	 */
	public function negate (){
		$this->myParam = 0;
		return $this;
	}
}
