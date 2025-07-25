"use strict";

const assert = require("assert");
const testFunc = require("./test-coverage").test;

describe("test func", function () {
    it("should show coverage on line 6", function () {
        var num = testFunc(4);
        assert(num === "reallyNull");
    });

    it("should show coverage", function () {
        var num = testFunc(3);
        assert(num === "notNull");
    });

    it("should show coverage", function () {
        var num = testFunc(9);
        assert(true);
    });

    it("should show coverage on line 9", function () {
        var num = testFunc(7);
        assert(num === "wap");
    });

    it("should show coverage on line 9 x2", function () {
        var num = testFunc(5);
        assert(num === "wap");
    });
});
