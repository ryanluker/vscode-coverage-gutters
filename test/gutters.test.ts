"use strict";

import * as assert from "assert";

import * as vscode from "vscode";
import {Gutters} from "../src/gutters";

suite("Gutters Tests", function() {
    test("Should setup gutters based on config values with no errors", function(done) {
        try {
            const gutters = new Gutters();
            return done();
        } catch(e) {
            assert.equal(1,2);
            return done();
        }
    });

    test("Should be able to dispose on a gutters object", function(done) {
        const gutters = new Gutters();
        return done(gutters.dispose());
    });
});