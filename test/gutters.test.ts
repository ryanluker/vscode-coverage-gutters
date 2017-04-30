import * as assert from "assert";
import * as vscode from "vscode";
import {Gutters} from "../src/gutters";
import {Reporter} from "../src/reporter";
import {StatusBarToggler} from "../src/statusbartoggler";

suite("Gutters Tests", function() {
    test("Should setup gutters based on config values with no errors", function(done) {
        this.timeout(12000);
        try {
            const ctx: vscode.ExtensionContext = {
                asAbsolutePath() {
                    return;
                },
                subscriptions: [],
            } as any;
            const reporter: Reporter = {
                sendEvent() {
                    return;
                },
            } as any;
            const statusbar: StatusBarToggler = {
                dispose() {
                    return;
                },
            } as any;

            const gutters = new Gutters(ctx, reporter, statusbar);
            return done();
        } catch (e) {
            return done(e);
        }
    });
});
