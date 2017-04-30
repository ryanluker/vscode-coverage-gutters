import * as assert from "assert";
import * as vscode from "vscode";
import {IConfigStore} from "../src/config";
import {Gutters} from "../src/gutters";
import {Indicators} from "../src/indicators";
import {Lcov} from "../src/lcov";
import {Reporter} from "../src/reporter";
import {StatusBarToggler} from "../src/statusbartoggler";

suite("Gutters Tests", function() {
    test("Should setup gutters based on config values with no errors", function(done) {
        this.timeout(12000);
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
            const lcov: Lcov = {
                sendEvent() {
                    return;
                },
            } as any;
            const indicators: Indicators = {
                sendEvent() {
                    return;
                },
            } as any;
            const configStore: IConfigStore = {
                sendEvent() {
                    return;
                },
            } as any;

            const gutters = new Gutters(configStore, lcov, indicators, reporter, statusbar);
            return done();
        } catch (e) {
            return done(e);
        }
    });
});
