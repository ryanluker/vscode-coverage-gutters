import * as assert from "assert";
import * as vscode from "vscode";
import {IConfigStore} from "../src/config";
import {Coverage} from "../src/coverage";
import {Gutters} from "../src/gutters";
import {Indicators} from "../src/indicators";
import {Reporter} from "../src/reporter";
import {StatusBarToggler} from "../src/statusbartoggler";

suite("Gutters Tests", function() {
    this.timeout(4000);

    test("Should setup gutters based on config values with no errors @unit", function(done) {
        try {
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
            const coverage: Coverage = {} as any;
            const indicators: Indicators = {} as any;
            const configStore: IConfigStore = {} as any;
            const outputChannel: vscode.OutputChannel = {} as any;

            const gutters = new Gutters(
                configStore,
                coverage,
                indicators,
                outputChannel,
                reporter,
                statusbar,
            );
            return done();
        } catch (e) {
            return done(e);
        }
    });

    test("Should not error when trying to render coverage on empty editor @unit", async function() {
        try {
            const reporter: Reporter = {
                sendEvent(cat, action) {
                    return;
                },
            } as any;
            const statusbar: StatusBarToggler = {
                dispose() {
                    return;
                },
            } as any;
            const coverage: Coverage = {
                find() {
                    return Promise.resolve("tempPath");
                },
                load(path) {
                    assert.equal(path, "tempPath");
                    return Promise.resolve("filehere");
                },
            } as any;
            const indicators: Indicators = {
                extract(file) {
                    assert.equal(file, "filehere");
                    return Promise.resolve([1, 2, 3]);
                },
                renderToTextEditor(lines) {
                    assert.equal(lines, [1, 2, 3]);
                    return Promise.resolve();
                },
            } as any;
            const configStore: IConfigStore = {} as any;
            const outputChannel: vscode.OutputChannel = {} as any;

            const gutters = new Gutters(
                configStore,
                coverage,
                indicators,
                outputChannel,
                reporter,
                statusbar,
            );
            await gutters.displayCoverageForActiveFile();
        } catch (error) {
            throw error;
        }
    });
});
