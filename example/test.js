'use strict';

const assert   = require('assert');
const testFunc = require('./test-coverage').test;

describe('test func', function() {
    it('should show coverage on line 8', function() {
        var num = testFunc(1);
        assert(num===true);
    });

    it('should show coverage on line 6', function() {
        var num = testFunc(4);
        assert(num==="reallyNull");
    });

    it('should show coverage on line 9', function() {
        var num = testFunc(6);
        assert(num==="wap");
    });

    it('should show coverage on line 9 x2', function() {
        var num = testFunc(5);
        assert(num==="woop");
    });
});