"use strict";

import * as assert from "assert";

import {Indicators} from "../../src/indicators";
import {LcovParse} from "../../src/wrappers/lcov-parse";
import {Vscode} from "../../src/wrappers/vscode";

suite("Indicators Tests", function() {
    const fakeConfig = {
        altSfCompare: false,
        fullCoverageDecorationType: {
            key: "testKey",
            dispose() {},
        },
        lcovFileName: "test.ts",
        partialCoverageDecorationType: {
            key: "testKey3",
            dispose() {},
        },
    };

    test("Constructor should setup properly", function(done) {
        try {
            const vscodeImpl = new Vscode();
            const parseImpl = new LcovParse();
            const indicators = new Indicators(
                parseImpl,
                vscodeImpl,
                fakeConfig,
            );
            return done();
        } catch (e) {
            assert.equal(1, 2);
            return done();
        }
    });

    test("#extract: should find a matching file with absolute match mode", function(done) {
        fakeConfig.altSfCompare = false;
        const vscodeImpl = new Vscode();
        const parseImpl = new LcovParse();

        const fakeLcov = "TN:\nSF:c:\/dev\/vscode-coverage-gutters\/example\/test-coverage.js\nDA:1,1\nend_of_record";
        const fakeFile = "c:\/dev\/vscode-coverage-gutters\/example\/test-coverage.js";
        const indicators = new Indicators(
            parseImpl,
            vscodeImpl,
            fakeConfig,
        );

        indicators.extract(fakeLcov, fakeFile)
            .then(function(data) {
                assert.equal(data.length, 1);
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });

    test("#extract: should find a matching file with relative match mode", function(done) {
        fakeConfig.altSfCompare = true;
        const vscodeImpl = new Vscode();
        vscodeImpl.getRootPath = function() { return "vscode-coverage-gutters"; };
        const parseImpl = new LcovParse();
        // tslint:disable-next-line:max-line-length
        const fakeLinuxLcov = "TN:\nSF:/mnt/c/dev/vscode-coverage-gutters/example/test-coverage.js\nDA:1,1\nend_of_record";
        const fakeFile = "c:\/dev\/vscode-coverage-gutters\/example\/test-coverage.js";
        const indicators = new Indicators(
            parseImpl,
            vscodeImpl,
            fakeConfig,
        );

        indicators.extract(fakeLinuxLcov, fakeFile)
            .then(function(data) {
                assert.equal(data.length, 1);
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });
});
