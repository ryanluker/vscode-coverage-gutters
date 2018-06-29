import * as assert from "assert";
import {Reporter} from "../src/reporter";
import {IOptions, RequestCallback} from "../src/wrappers/request";

suite("Reporter Tests", function() {
    test("Should not report metrics if enabledMetrics false @unit", function() {
        const fakeRequest = {
            post(uri: string, options?: IOptions) {
                assert.equal(1, 2);
                return;
            },
        };

        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeRequest, fakeUuid, "", false);
        reporter.sendEvent("test", "action");
    });

    test("Should send metrics if enabledMetrics is true @unit", function() {
        const fakeRequest = {
            post(uri: string, options?: IOptions) {
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

        const reporter = new Reporter(fakeRequest, fakeUuid, "", true);
        reporter.sendEvent("test", "action");
    });

    test("GA tracking id should not be set in code @unit", function() {
        const fakeRequest = {
            post(uri: string, options?: IOptions) {
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

        const reporter = new Reporter(fakeRequest, fakeUuid, "", true);
        reporter.sendEvent("test", "action");
    });

    test("GA tracking id should be set by env variable @unit", function() {
        const fakeRequest = {
            post(uri: string, options?: IOptions) {
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

        const reporter = new Reporter(fakeRequest, fakeUuid, "123", true);
        reporter.sendEvent("test", "action");
    });

    test("Error when sending report should not propagate", function() {
        const fakeRequest = {
            post(uri: string, options?: IOptions, callback?: RequestCallback) {
                const errormessage = "getaddrinfo ENOTFOUND www.google-analytics.com www.google-analytics.com:443";
                return callback(new Error(errormessage), null, null);
            },
        };

        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeRequest, fakeUuid, "123", true);
        reporter.sendEvent("test", "action");
    });
});
