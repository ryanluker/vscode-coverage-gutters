"use strict";

import * as assert from "assert";

import * as vscode from "vscode";
import {Gutters} from "../src/gutters";

suite("Gutters Tests", () => {
    test("Should setup gutters based on config values with no errors", function() {
        const gutters = new Gutters();
    });
});