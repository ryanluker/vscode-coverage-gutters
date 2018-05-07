import * as assert from "assert";
import {Reporter} from "../src/reporter";
import {IOptions} from "../src/wrappers/request";

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
                // tslint:disable-next-line:no-string-literal
                assert.equal(options.form["tid"], "123");
                return;
            },
        };

        const fakeUuid = "fakeuuidhere";

        const reporter = new Reporter(fakeRequest, fakeUuid, "123", true);
        reporter.sendEvent("test", "action");
    });
});
