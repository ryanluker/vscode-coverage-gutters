"use strict";

import * as assert from "assert";

import * as vscode from "vscode";
import {Gutters} from "../src/gutters";

suite("Gutters Tests", function() {
    test("Should setup gutters based on config values with no errors", function(done) {
        try {
            let ctx: vscode.ExtensionContext = <any>{
                subscriptions: [],
                asAbsolutePath: function() {
                    return "test";
                }
            };
            const gutters = new Gutters(ctx);
            return done();
        } catch(e) {
            return done(e);
        }
    });
});