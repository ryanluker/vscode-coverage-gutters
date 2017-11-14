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
        showStatusBarToggler: true,
        xmlFileName: "test.xml",
    };

    test("Constructor should setup properly", function(done) {
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

    test("#find: Should not return error if more then one file found for lcovFileName", function(done) {
        const globImpl = new Glob();
        const vscodeImpl = new Vscode();
        vscodeImpl.getWorkspaceFolders = function() { return [{uri: {path: "vscode-coverage-gutters"}} as any]; };
        const fsImpl = new Fs();

        globImpl.find = function(path, options, cb) {
            if (path.includes("xml")) { return cb(null, []); }
            assert.equal(options.ignore, "**/node_modules/**");
            assert.equal(options.dot, true);
            return cb(null, ["1", "2"]);
        };
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );
        coverage.findCoverageFiles()
            .then(function(files) {
                assert.equal(files.length, 2);
                return done();
            })
            .catch(function(error) {
                return done(new Error("unexpected error did fire!"));
            });
    });

    test("#find: Should return error if no file found for lcovFileName or xmlFileName", function(done) {
        const globImpl = new Glob();
        const vscodeImpl = new Vscode();
        vscodeImpl.getWorkspaceFolders = function() { return [{uri: {path: "vscode-coverage-gutters"}} as any]; };
        const fsImpl = new Fs();

        globImpl.find = function(path, options, cb) {
            assert.equal(options.ignore, "**/node_modules/**");
            return cb(null, null);
        };
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.findCoverageFiles()
            .then(function() {
                return done(new Error("Expected error did not fire!"));
            })
            .catch(function(error) {
                if (error.name === "AssertionError") { return done(error); }
                if (error.message === "Could not find a Coverage file!") { return done(); }
                return done(error);
            });
    });

    test("#find: Should return file paths from open workspace folders", function(done) {
        const vscodeImpl = new Vscode();
        vscodeImpl.getWorkspaceFolders = function() { return [
            {uri: {path: "vscode-coverage-gutters1"}} as any,
            {uri: {path: "vscode-coverage-gutters2"}} as any,
        ]; };
        const globImpl = new Glob();
        const fsImpl = new Fs();

        let count = 0;
        globImpl.find = function(path, options, cb) {
            count++;
            assert.equal(options.ignore, "**/node_modules/**");
            return cb(null, [`path/to/greatness/test${count}.ts`]);
        };
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.findCoverageFiles()
            .then(function(fsPaths) {
                // two files for xml two files for lcov
                assert.equal(fsPaths.length, 4);
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });

    test("#find: Should return file paths from open workspace folders without dupes", function(done) {
        const vscodeImpl = new Vscode();
        vscodeImpl.getWorkspaceFolders = function() { return [
            {uri: {path: "vscode-coverage-gutters1"}} as any,
            {uri: {path: "vscode-coverage-gutters2"}} as any,
        ]; };
        const globImpl = new Glob();
        const fsImpl = new Fs();

        globImpl.find = function(path, options, cb) {
            assert.equal(options.ignore, "**/node_modules/**");
            return cb(null, [`path/to/greatness/test.ts`]);
        };
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.findCoverageFiles()
            .then(function(fsPaths) {
                // two files for xml two files for lcov all with the same name
                // get deduped to one
                assert.equal(fsPaths.length, 1);
                return done();
            })
            .catch(function(error) {
                return done(error);
            });
    });

    test("#find: Should return a file system path", function(done) {
        const vscodeImpl = new Vscode();
        vscodeImpl.getWorkspaceFolders = function() { return [{uri: {path: "vscode-coverage-gutters"}} as any]; };
        const globImpl = new Glob();
        const fsImpl = new Fs();

        globImpl.find = function(path, options, cb) {
            assert.equal(options.ignore, "**/node_modules/**");
            return cb(null, ["path/to/greatness/test.ts"]);
        };
        const coverage = new Coverage(
            fakeConfig,
            globImpl,
            vscodeImpl,
            fsImpl,
        );

        coverage.findCoverageFiles()
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

    test("#load: Should return a data string", function(done) {
        const vscodeImpl = new Vscode();
        const globImpl = new Glob();
        const fsImpl = new Fs();

        fsImpl.readFile = function(path: string, cb) {
            assert.equal(path, "pathtofile");
            return cb(null, new Buffer("lcovhere"));
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
            .catch(function(error) {
                return done(error);
            });
    });

    test("#pickFile: Should return undefined if no item is picked", function(done) {
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
                assert.equal(value, undefined);
                return done();
            })
            .catch((error) => {
                return done(error);
            });
    });
});
