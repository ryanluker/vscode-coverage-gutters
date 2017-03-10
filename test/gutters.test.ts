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
});