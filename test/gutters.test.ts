import * as assert from "assert";
import * as vscode from "vscode";
import {Gutters} from "../src/gutters";
import {Reporter} from "../src/reporter";

suite("Gutters Tests", function() {
    test("Should setup gutters based on config values with no errors", function(done) {
        this.timeout(12000);
        try {
            const ctx: vscode.ExtensionContext = {
                asAbsolutePath() {
                    return "test";
                },
                subscriptions: [],
            } as any;
            const reporter: Reporter = {
                sendEvent() {
                    return;
                },
            } as any;

            const gutters = new Gutters(ctx, reporter);
            assert.equal(gutters.getTextEditors().length, 0);
            return done();
        } catch (e) {
            return done(e);
        }
    });

    test("Should remove the activeEditor from the textEditors array", async function() {
        this.timeout(12000);
        const ctx: vscode.ExtensionContext = {
            asAbsolutePath() {
                return "test";
            },
            subscriptions: [],
        } as any;
        const reporter: Reporter = {
            sendEvent() {
                return;
            },
        } as any;

        const gutters = new Gutters(ctx, reporter);
        await gutters.displayCoverageForActiveFile();
        assert.equal(gutters.getTextEditors().length, 1);
        gutters.removeCoverageForActiveFile();
        assert.equal(gutters.getTextEditors().length, 0);
    });
});
