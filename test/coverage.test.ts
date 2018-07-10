import * as assert from "assert";
import {Coverage} from "../src/coverage";
import {Fs} from "../src/wrappers/fs";
import {Glob} from "../src/wrappers/glob";
import {Vscode} from "../src/wrappers/vscode";

suite("Coverage Tests", function() {
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
        sectionMatchThreshold: 50,
        showStatusBarToggler: true,
        xmlFileName: "test.xml",
    };

    test("Constructor should setup properly @unit", function(done) {
        try {
            const blobImpl = new Glob();
            const vscodeImpl = new Vscode();
            const fsImpl = new Fs();
            const coverage = new Coverage(
                fakeConfig,
                blobImpl,
                vscodeImpl,
                fsImpl,
            );
            return done();
        } catch (e) {
            assert.equal(1, 2);
            return done();
        }
    });

    test("#load: Should reject when readFile returns an error @unit", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();

        fsImpl.readFile = function(path: string, cb) {
            assert.equal(path, "pathtofile");
            const error: NodeJS.ErrnoException = new Error("could not read from fs");
            return cb(error, new Buffer(""));
        };
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.load("pathtofile")
            .then(function() {
                return done(new Error("Expected error did not fire!"));
            })
            .catch(function(error) {
                if (error.name === "AssertionError") { return done(error); }
                if (error.message === "could not read from fs") { return done(); }
                return done(error);
            });
    });

    test("#load: Should return a data string @unit", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();

        fsImpl.readFile = function(path: string, cb: (err: NodeJS.ErrnoException, data: Buffer) => void) {
            assert.equal(path, "pathtofile");
            return cb(undefined as any, new Buffer("lcovhere"));
        };

        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.load("pathtofile")
            .then(function(dataString) {
                assert.equal(dataString, "lcovhere");
                return done();
            })
            .catch(function() {
                return done(new Error("should not get here"));
            });
    });

    test("#pickFile: Should return undefined if no item is picked @unit", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();
        vscodeImpl.showQuickPick = async () => undefined;
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.pickFile(["test1", "test2"], "nope")
            .then((value) => {
                return done(new Error("Expected error did not fire!"));
            })
            .catch((error) => {
                assert.equal(error.message, "Did not choose a file!");
                return done();
            });
    });

    test("#pickFile: Should return string if filePaths is a string @unit", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.pickFile("123", "nope")
            .then((value) => {
                assert.equal(value, "123");
                return done();
            })
            .catch((error) => {
                return done(error);
            });
    });

    test("#pickFile: Should return string if filePaths is an array with one value @unit", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.pickFile(["123"], "nope")
            .then((value) => {
                assert.equal(value, "123");
                return done();
            })
            .catch((error) => {
                return done(error);
            });
    });
});
