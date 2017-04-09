import * as assert from "assert";
import {Options} from "../src/wrappers/request";
import {Reporter} from "../src/reporter";

suite("Reporter Tests", function() {
    test("Should not report metrics if enabledMetrics false", function() {
        const fakeRequest = {
            post(uri: string, options?: Object) {
                assert.equal(1, 2);
                return;
            }
        }

        const fakeUuid = {
            get() {
                return "fakeuuidhere";
            }
        }

        const reporter = new Reporter(fakeRequest, fakeUuid, false);
        reporter.sendEvent("test", "action");
    });

    test("Should send metrics if enabledMetrics is true", function() {
        const fakeRequest = {
            post(uri: string, options?: Options) {
                // tslint:disable-next-line:no-string-literal
                assert.equal(options.form["ec"], "test");
                return;
            }
        }

        const fakeUuid = {
            get() {
                return "fakeuuidhere";
            }
        }

        const reporter = new Reporter(fakeRequest, fakeUuid, true);
        reporter.sendEvent("test", "action");
    });

    test("GA tracking id should not be set in code", function() {
        const fakeRequest = {
            post(uri: string, options?: Options) {
                // tslint:disable-next-line:no-string-literal
                assert.equal(options.form["tid"], "");
                return;
            }
        }

        const fakeUuid = {
            get() {
                return "fakeuuidhere";
            }
        }

        const reporter = new Reporter(fakeRequest, fakeUuid, true);
        reporter.sendEvent("test", "action");
    });
});
