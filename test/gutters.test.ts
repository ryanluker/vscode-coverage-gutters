"use strict";

import * as assert from "assert";

import * as vscode from "vscode";
import {Gutters} from "../src/gutters";

suite("Gutters Tests", () => {
    test("Should set indicators to empty array after initialize", () => {
        let gutters = new Gutters();
        assert.equal(gutters.getIndicators(), []);
    });
});