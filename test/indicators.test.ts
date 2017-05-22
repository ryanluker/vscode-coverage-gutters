import * as assert from "assert";
import {BranchDetail, LcovSection} from "lcov-parse";
import {TextEditor} from "vscode";

import {Indicators} from "../src/indicators";
import {LcovParse} from "../src/wrappers/lcov-parse";
import {Vscode} from "../src/wrappers/vscode";

suite("Indicators Tests", function() {
    const fakeConfig = {
        altSfCompare: false,
        fullCoverageDecorationType: {
            key: "testKey",
            dispose() {},
        },
        lcovFileName: "test.ts",
        noCoverageDecorationType: {
            key: "testKey4",
            dispose() {},
        },
        partialCoverageDecorationType: {
            key: "testKey3",
            dispose() {},
        },
        showStatusBarToggler: true,
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

    test("#renderToTextEditor: should set basic coverage", function(done) {
        let callsToSetDecorations = 0;

        const vscodeImpl = new Vscode();
        const parseImpl = new LcovParse();
        const indicators = new Indicators(
            parseImpl,
            vscodeImpl,
            fakeConfig,
        );

        const fakeSection: LcovSection = {
            branches: {
                details: [],
                found: 1,
                hit: 1,
            },
            file: "test",
            functions: {
                details: [],
                found: 1,
                hit: 1,
            },
            lines: {
                details: [{
                    hit: 1,
                    line: 10,
                }],
                found: 1,
                hit: 1,
            },
        };

        const fakeTextEditor: any = {
            setDecorations(decorType, ranges) {
                callsToSetDecorations++;
                if (callsToSetDecorations !== 4) {
                    return;
                } else {
                    assert.equal(ranges.length, 1);
                    return;
                }
            },
        };

        indicators.renderToTextEditor(fakeSection, fakeTextEditor)
            .then(function() {
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });

    test("#renderToTextEditor: should remove full coverage if partial on same line", function(done) {
        let callsToSetDecorations = 0;

        const vscodeImpl = new Vscode();
        const parseImpl = new LcovParse();
        const indicators = new Indicators(
            parseImpl,
            vscodeImpl,
            fakeConfig,
        );

        const fakeSection: LcovSection = {
            branches: {
                details: [{
                    block: 0,
                    branch: 0,
                    line: 10,
                    taken: 0,
                }],
                found: 1,
                hit: 1,
            },
            file: "test",
            functions: {
                details: [],
                found: 1,
                hit: 1,
            },
            lines: {
                details: [{
                    hit: 1,
                    line: 10,
                }],
                found: 1,
                hit: 1,
            },
        };

        const fakeTextEditor: any = {
            setDecorations(decorType, ranges) {
                callsToSetDecorations++;
                switch (callsToSetDecorations) {
                    case 4: {
                        assert.equal(ranges.length, 0);
                        return;
                    }
                    case 6: {
                        assert.equal(ranges.length, 1);
                        return;
                    }
                    default:
                        return;
                }
            },
        };

        indicators.renderToTextEditor(fakeSection, fakeTextEditor)
            .then(function() {
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });

    test("#renderToTextEditor: should render full coverage and no coverage", function(done) {
        let callsToSetDecorations = 0;

        const vscodeImpl = new Vscode();
        const parseImpl = new LcovParse();
        const indicators = new Indicators(
            parseImpl,
            vscodeImpl,
            fakeConfig,
        );

        const fakeSection: LcovSection = {
            branches: {
                details: [],
                found: 1,
                hit: 1,
            },
            file: "test",
            functions: {
                details: [],
                found: 1,
                hit: 1,
            },
            lines: {
                details: [{
                    hit: 1,
                    line: 10,
                }, {
                    hit: 0,
                    line: 5,
                }],
                found: 1,
                hit: 1,
            },
        };

        const fakeTextEditor: any = {
            setDecorations(decorType, ranges) {
                callsToSetDecorations++;
                switch (callsToSetDecorations) {
                    case 4: {
                        assert.equal(ranges.length, 1);
                        return;
                    }
                    case 5: {
                        assert.equal(ranges.length, 1);
                        return;
                    }
                    default:
                        return;
                }
            },
        };

        indicators.renderToTextEditor(fakeSection, fakeTextEditor)
            .then(function() {
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
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
                assert.equal(data.lines.details.length, 1);
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
                assert.equal(data.lines.details.length, 1);
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });
});
