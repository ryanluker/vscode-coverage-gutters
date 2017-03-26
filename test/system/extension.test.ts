import * as assert from "assert";

import * as vscode from "vscode";
import * as myExtension from "../../src/extension";

suite("Extension Tests", function() {
    test("Should not active a second extension instance", function(done) {
        let ctx: vscode.ExtensionContext = <any> {
            asAbsolutePath() {
                return "test";
            },
            subscriptions: [],
        };

        try {
            myExtension.activate(ctx);
        } catch (e) {
            assert.equal(e.message, "command with id already exists");
            return done();
        }
    });
});
