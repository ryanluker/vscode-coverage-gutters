'use strict';

const assert   = require('assert');
const testFunc = require('./test-coverage').test;

describe('test func', function() {
    it('should show coverage on line 8', function() {
        var num = testFunc(3);
        assert(num==="null");
    });

    it('should show coverage on line 6', function() {
        var num = testFunc(2);
        assert(num===false);
    });
});