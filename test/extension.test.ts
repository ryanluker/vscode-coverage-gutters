'use strict';

import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../src/extension";

suite("Extension Tests", function() {
    test("Should activate have subscriptions of length 3", function(done) {
        let ctx: vscode.ExtensionContext = <any>{
            subscriptions: []
        };

        myExtension.activate(ctx);
        assert.equal(ctx.subscriptions.length, 3);
        return done();
    });
});