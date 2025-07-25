"use strict";

const assert = require("assert");
const testFunc = require("./test-coverage").test;

describe("test func", function () {
    it("should show coverage on line 3", function () {
        var num = testFunc(1);
        assert(num === true);
    });
});
