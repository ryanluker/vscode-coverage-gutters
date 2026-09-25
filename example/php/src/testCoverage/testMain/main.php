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

        /**
         * Demonstrates partial branch coverage
         * Tests only even path, leaving odd branch uncovered
         */
        public function processNumber($value) {
                if ($value % 2 === 0) {
                        return $value * 2;  // This branch is tested
                } else {
                        return $value + 1;  // This branch is NOT tested
                }
        }

        /**
         * Complex condition with multiple branches
         * Only partially tested to show branch coverage gaps
         */
        public function validateInput($input, $type) {
                if ($input !== null && $type === 'numeric' && is_numeric($input)) {
                        return (int)$input;  // Partially covered
                }
                return 0;  // Default fallback
        }
