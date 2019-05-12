import * as assert from "assert";
import * as request from "request";

import {CoreOptions, RequestCallback} from "request";
import {Reporter} from "../../src/extension/reporter";

// Original functions
const post = request.post;

suite("Reporter Tests", function() {
    teardown(function() {
        (request as any).post = post;
    });

    test("Should not report metrics if enabledMetrics false @unit", function() {
        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, false);
        const result = reporter.sendEvent("test", "action");
        assert.strictEqual(result, undefined);
    });

    test("Should send metrics if enabledMetrics is true @unit", function() {
        const fakeRequestPost = (uri: string, options?: CoreOptions) => {
            if (!options) {
                throw new Error("Options is undefined.");
            }
            if (!options.form) {
                throw new Error("Options.form is undefined.");
            }
            // tslint:disable-next-line:no-string-literal
            assert.equal(options.form["ec"], "test");
            return;
        };
        (request as any).post = fakeRequestPost;
        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });

    test("GA tracking id should not be set in code @unit", function() {
        const fakeRequestPost = (uri: string, options?: CoreOptions) => {
            if (!options) {
                throw new Error("Options is undefined.");
            }
            if (!options.form) {
                throw new Error("Options.form is undefined.");
            }
            // tslint:disable-next-line:no-string-literal
            assert.equal(options.form["tid"], "");
            return;
        };
        (request as any).post = fakeRequestPost;
        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });

    // #198 Unskip this test once the GA tracker is added via env variable
    test.skip("GA tracking id should be set by env variable @unit", function() {
        const fakeRequestPost = (uri: string, options?: CoreOptions) => {
            if (!options) {
                throw new Error("Options is undefined.");
            }
            if (!options.form) {
                throw new Error("Options.form is undefined.");
            }
            // tslint:disable-next-line:no-string-literal
            assert.equal(options.form["tid"], "123");
            return;
        };
        (request as any).post = fakeRequestPost;
        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });

    test("Error when sending report should not propagate", function() {
        const fakeRequestPost = (uri: string, options?: CoreOptions, callback?: RequestCallback) => {
            if (!callback) {
                throw new Error("Callback is undefined.");
            }
            const errormessage = "getaddrinfo ENOTFOUND www.google-analytics.com www.google-analytics.com:443";
            return callback(new Error(errormessage), null as any, null);
        };
        (request as any).post = fakeRequestPost;
        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });
});
