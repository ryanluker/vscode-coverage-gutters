import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../src/extension";

suite("Extension Tests", function() {
    test("Should activate have subscriptions of length 3 on macos or error on linxu / windows", function(done) {
        let ctx: vscode.ExtensionContext = <any> {
            asAbsolutePath() {
                return "test";
            },
            subscriptions: [],
        };

        try {
            myExtension.activate(ctx);
        } catch (e) {
            // only for linux / windows environments
            assert.equal("command with id already exists", e.message);
            return done();
        }

        assert.equal(ctx.subscriptions.length, 4);
        return done();
    });
});
