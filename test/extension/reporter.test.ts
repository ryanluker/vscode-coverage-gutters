import * as assert from "assert";
import {CoreOptions, RequestCallback} from "request";
import {Reporter} from "../../src/extension/reporter";

suite("Reporter Tests", function() {
    test("Should not report metrics if enabledMetrics false @unit", function() {
        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, false);
        reporter.sendEvent("test", "action");
    });

    test.skip("Should send metrics if enabledMetrics is true @unit", function() {
        const fakeRequest = {
            post(uri: string, options?: CoreOptions) {
                if (!options) {
                    throw new Error("Options is undefined.");
                }
                if (!options.form) {
                    throw new Error("Options.form is undefined.");
                }
                // tslint:disable-next-line:no-string-literal
                assert.equal(options.form["ec"], "test");
                return;
            },
        };

        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });

    test.skip("GA tracking id should not be set in code @unit", function() {
        const fakeRequest = {
            post(uri: string, options?: CoreOptions) {
                if (!options) {
                    throw new Error("Options is undefined.");
                }
                if (!options.form) {
                    throw new Error("Options.form is undefined.");
                }
                // tslint:disable-next-line:no-string-literal
                assert.equal(options.form["tid"], "");
                return;
            },
        };

        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });

    test.skip("GA tracking id should be set by env variable @unit", function() {
        const fakeRequest = {
            post(uri: string, options?: CoreOptions) {
                if (!options) {
                    throw new Error("Options is undefined.");
                }
                if (!options.form) {
                    throw new Error("Options.form is undefined.");
                }
                // tslint:disable-next-line:no-string-literal
                assert.equal(options.form["tid"], "123");
                return;
            },
        };

        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });

    test.skip("Error when sending report should not propagate", function() {
        const fakeRequest = {
            post(uri: string, options?: CoreOptions, callback?: RequestCallback) {
                if (!callback) {
                    throw new Error("Callback is undefined.");
                }
                const errormessage = "getaddrinfo ENOTFOUND www.google-analytics.com www.google-analytics.com:443";
                return callback(new Error(errormessage), null as any, null);
            },
        };

        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeUuid, true);
        reporter.sendEvent("test", "action");
    });
});
