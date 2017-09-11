import * as assert from "assert";
import {Lcov} from "../src/lcov";
import {Fs} from "../src/wrappers/fs";
import {Glob} from "../src/wrappers/glob";
import {Vscode} from "../src/wrappers/vscode";

suite("Lcov Tests", function() {
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
            const blobImpl = new Glob();
            const vscodeImpl = new Vscode();
            const fsImpl = new Fs();
            const lcov = new Lcov(
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

    test("#find: Should not return error if more then one file found for lcovFileName", function(done) {
        const globImpl = new Glob();
        const vscodeImpl = new Vscode();
        const fsImpl = new Fs();

        globImpl.find = function(path, options, cb) {
            assert.equal(path, "**/test.ts");
            assert.equal(options.ignore, "**/node_modules/**");
            assert.equal(options.dot, true);
            return cb(null, ["1", "2"]);
        };
        const lcov = new Lcov(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        lcov.findLcovs()
            .then(function(files) {
                assert.equal(files.length, 2);
                return done();
            })
            .catch(function(error) {
                return done(new Error("unexpected error did fire!"));
            });
    });

    test("#find: Should return error if no file found for lcovFileName", function(done) {
        const globImpl = new Glob();
        const vscodeImpl = new Vscode();
        const fsImpl = new Fs();

        globImpl.find = function(path, options, cb) {
            assert.equal(path, "**/test.ts");
            assert.equal(options.ignore, "**/node_modules/**");
            return cb(null, null);
        };
        const lcov = new Lcov(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        lcov.findLcovs()
            .then(function() {
                return done(new Error("Expected error did not fire!"));
            })
            .catch(function(error) {
                if (error.name === "AssertionError") { return done(error); }
                if (error === "Could not find a Lcov File!") { return done(); }
                return done(error);
            });
    });

    test("#find: Should return a file system path", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();

        globImpl.find = function(path, options, cb) {
            assert.equal(path, "**/test.ts");
            assert.equal(options.ignore, "**/node_modules/**");
            return cb(null, ["path/to/greatness/test.ts"]);
        };
        const lcov = new Lcov(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        lcov.findLcovs()
            .then(function(fsPaths) {
                assert.equal(fsPaths[0], "path/to/greatness/test.ts");
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });

    test("#load: Should reject when readFile returns an error", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();

        fsImpl.readFile = function(path: string, cb) {
            assert.equal(path, "pathtofile");
            const error: NodeJS.ErrnoException = new Error("could not read from fs");
            return cb(error, null);
        };
        const lcov = new Lcov(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        lcov.load("pathtofile")
            .then(function() {
                return done(new Error("Expected error did not fire!"));
            })
            .catch(function(error) {
                if (error.name === "AssertionError") { return done(error); }
                if (error.message === "could not read from fs") { return done(); }
                return done(error);
            });
    });

    test("#load: Should return a data string", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();

        fsImpl.readFile = function(path: string, cb) {
            assert.equal(path, "pathtofile");
            return cb(null, new Buffer("lcovhere"));
        };
        const lcov = new Lcov(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        lcov.load("pathtofile")
            .then(function(dataString) {
                assert.equal(dataString, "lcovhere");
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });
});
