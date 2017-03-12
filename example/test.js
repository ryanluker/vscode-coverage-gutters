'use strict';

const assert   = require('assert');
const testFunc = require('./test-coverage').test;

describe('test func', function() {
    it('should not show coverage on lines 5 and 9', function() {
        var num = testFunc(3);
        assert(num==="null");
    });
});