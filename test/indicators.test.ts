"use strict";

import * as assert from "assert";

import {vscode} from "../src/wrappers/vscode";
import {lcovParse} from "../src/wrappers/lcov-parse";
import {Indicators} from "../src/indicators";

suite("Indicators Tests", function() {
    const fakeConfig = {
        lcovFileName: "test.ts",
        coverageDecorationType: {
            key: "testKey",
            dispose() {}
        },
        gutterDecorationType: {
            key: "testKey2",
            dispose() {}
        },
        altSfCompare: false
    };

    test("Constructor should setup properly", function(done) {
        try {
            const vscodeImpl = new vscode();
            const parseImpl = new lcovParse();
            const indicators = new Indicators(
                parseImpl,
                vscodeImpl,
                fakeConfig
            );
            return done();
        } catch(e) {
            assert.equal(1,2);
            return done();
        }
    });

    test("#extract: should find a matching file with absolute match mode", function(done) {
        fakeConfig.altSfCompare = false;
        const vscodeImpl = new vscode();
        const parseImpl = new lcovParse();

        const fakeLcov = "TN:\nSF:c:\/dev\/vscode-coverage-gutters\/example\/test-coverage.js\nDA:1,1\nend_of_record";
        const fakeFile = "c:\/dev\/vscode-coverage-gutters\/example\/test-coverage.js";
        const indicators = new Indicators(
            parseImpl,
            vscodeImpl,
            fakeConfig
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
        const vscodeImpl = new vscode();
        vscodeImpl.getRootPath = function() { return "vscode-coverage-gutters"; };
        const parseImpl = new lcovParse();
        const fakeLinuxLcov = "TN:\nSF:/mnt/c/dev/vscode-coverage-gutters/example/test-coverage.js\nDA:1,1\nend_of_record";
        const fakeFile = "c:\/dev\/vscode-coverage-gutters\/example\/test-coverage.js";
        const indicators = new Indicators(
            parseImpl,
            vscodeImpl,
            fakeConfig
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