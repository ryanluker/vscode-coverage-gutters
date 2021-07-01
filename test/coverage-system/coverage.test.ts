import { expect } from "chai";
import fs from "fs";
import * as vscode from "vscode";

import {Coverage} from "../../src/coverage-system/coverage";
import stubConfig from "../stubs/Config";

// Original functions
const readFile = fs.readFile;
const showQuickPick = vscode.window.showQuickPick;

suite("Coverage Tests", function() {
    teardown(function() {
        (fs as any).readFile = readFile;
        (vscode as any).window.showQuickPick = showQuickPick;
    });

    test("Constructor should setup properly @unit", function() {
        expect(() => {
            new Coverage(stubConfig); // tslint:disable-line
        }).not.to.throw();
    });

    test("#load: Should reject when readFile returns an error @unit", function(done) {
        // tslint:disable-next-line
        const readFile = function(path: string, cb) {
            expect(path).to.equal("pathtofile");
            const error: NodeJS.ErrnoException = new Error("could not read from fs");
            return cb(error, Buffer.from(""));
        };
        (fs as any).readFile = readFile;

        const coverage = new Coverage(
            stubConfig,
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
        // tslint:disable-next-line
        const readFile = function(path: string, cb: (err: NodeJS.ErrnoException, data: Buffer) => void) {
            expect(path).to.equal("pathtofile");
            return cb(undefined as any, Buffer.from("lcovhere"));
        };
        (fs as any).readFile = readFile;

        const coverage = new Coverage(
            stubConfig,
        );

        coverage.load("pathtofile")
            .then(function(dataString) {
                expect(dataString).to.equal("lcovhere");
                return done();
            })
            .catch(function() {
                return done(new Error("should not get here"));
            });
    });

    test("#pickFile: Should return undefined if no item is picked @unit", function(done) {
        const showQuickPick = async () => undefined; // tslint:disable-line
        (vscode as any).window.showQuickPick = showQuickPick;

        let captureMessage = "";
        const showWarningMessage = async (message: string) => captureMessage=message; // tslint:disable-line
        (vscode as any).window.showWarningMessage = showWarningMessage;

        const coverage = new Coverage(
            stubConfig,
        );

        coverage.pickFile(["test1", "test2"], "nope")
            .then((value) => {
                expect(captureMessage).to.equal("Did not choose a file!");
                return done();
            });
    });

    test("#pickFile: Should return string if filePaths is a string @unit", function(done) {
        const coverage = new Coverage(
            stubConfig,
        );

        coverage.pickFile("123", "nope")
            .then((value) => {
                expect(value).to.equal("123");
                return done();
            })
            .catch((error) => {
                return done(error);
            });
    });

    test("#pickFile: Should return string if filePaths is an array with one value @unit", function(done) {
        const coverage = new Coverage(
            stubConfig,
        );

        coverage.pickFile(["123"], "nope")
            .then((value) => {
                expect(value).to.equal("123");
                return done();
            })
            .catch((error) => {
                return done(error);
            });
    });
});
