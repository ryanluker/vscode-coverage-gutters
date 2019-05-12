import * as assert from "assert";
import * as fs from "fs";
import * as vscode from "vscode";

import {Coverage} from "../../src/coverage-system/coverage";
import {fakeConfig} from "../mocks/fakeConfig";

// Original functions
const readFile = fs.readFile;
const showQuickPick = vscode.window.showQuickPick;

suite("Coverage Tests", function() {
    teardown(function() {
        (fs as any).readFile = readFile;
        (vscode as any).window.showQuickPick = showQuickPick;
    });

    test("Constructor should setup properly @unit", function(done) {
        try {
            new Coverage(
                fakeConfig,
            );
            return done();
        } catch (e) {
            assert.equal(1, 2);
            return done();
        }
    });

    test("#load: Should reject when readFile returns an error @unit", function(done) {
        const readFile = function(path: string, cb) {
            assert.equal(path, "pathtofile");
            const error: NodeJS.ErrnoException = new Error("could not read from fs");
            return cb(error, new Buffer(""));
        };
        (fs as any).readFile = readFile;

        const coverage = new Coverage(
            fakeConfig,
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
        const readFile = function(path: string, cb: (err: NodeJS.ErrnoException, data: Buffer) => void) {
            assert.equal(path, "pathtofile");
            return cb(undefined as any, new Buffer("lcovhere"));
        };
        (fs as any).readFile = readFile;

        const coverage = new Coverage(
            fakeConfig,
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
        const showQuickPick = async () => undefined;
        (vscode as any).window.showQuickPick = showQuickPick;

        const coverage = new Coverage(
            fakeConfig,
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
        const coverage = new Coverage(
            fakeConfig,
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
        const coverage = new Coverage(
            fakeConfig,
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
