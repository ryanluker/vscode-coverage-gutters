"use strict";

import * as assert from "assert";

import * as vscode from "vscode";
import {Gutters} from "../src/gutters";

suite("Gutters Tests", () => {
    test("Should properly setup gutters on initialize", () => {
        let gutters = new Gutters("fakepath");
        assert.notEqual(gutters.getIndicators(), undefined);
        assert.equal(gutters.getWorkspacePath(), "fakepath");
        assert.equal(gutters.getLcovPath(), "fakepath/coverage/lcov.info");
    });

    test("Should error when given a fake path to find lcov for", () => {
        let gutters = new Gutters("fakepath2");

        gutters.displayCoverageForFile("fakepath3").then(() => {
            assert.equal(true, false);
        });
    });
});