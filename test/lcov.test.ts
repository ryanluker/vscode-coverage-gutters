"use strict";

import * as assert from "assert";

import * as vscode from "vscode";
import {Lcov} from "../src/lcov";

suite("Lcov Tests", function() {
    test("Constructor should setup properly", function(done) {
        try {
            const lcov = new Lcov(
                {
                    lcovFileName: "test.ts",
                    coverageDecorationType: {
                        key: "testKey",
                        dispose() {}
                    }
                },
                function(){},
                function(path: string){});
            return done();
        } catch(e) {
            assert.equal(1,2);
            return done();
        }
    });

    test("#find: Should return error if no file found for lcovFileName", async function(done) {
        const lcov = new Lcov(
            {
                lcovFileName: "test.ts",
                coverageDecorationType: {
                    key: "testKey",
                    dispose() {}
                }
            },
            function(path, exclude, filesToFind) {
                assert.equal(path, "**/test.ts");
                assert.equal(exclude, "**/node_modules/**");
                assert.equal(filesToFind, 1);
                return new Promise(function(resolve, reject) {
                    return resolve([]);
                });
            },
            function(path: string){});

        try {
            await lcov.find();
        } catch(error) {
            if(error.name === "AssertionError") return done(error);
            if(error.message === "Could not find a lcov file!") return done();
            return done(error);
        }

        return done(new Error("Expected error did not fire!"));
    });

    test("#find: Should return a file system path", async function(done) {
        const lcov = new Lcov(
            {
                lcovFileName: "test.ts",
                coverageDecorationType: {
                    key: "testKey",
                    dispose() {}
                }
            },
            function(path, exclude, filesToFind) {
                assert.equal(path, "**/test.ts");
                assert.equal(exclude, "**/node_modules/**");
                assert.equal(filesToFind, 1);
                return new Promise(function(resolve, reject) {
                    return resolve([{fsPath: "path/to/greatness/test.ts"}]);
                });
            },
            function(path: string){});

        try {
            const fsPath = await lcov.find();
            assert.equal(fsPath, "path/to/greatness/test.ts");
            return done();
        } catch(error) {
            return done(error);
        }
    });

    test("#load: Should reject when readFile returns an error", async function(done) {
        const lcov = new Lcov(
            {
                lcovFileName: "test.ts",
                coverageDecorationType: {
                    key: "testKey",
                    dispose() {}
                }
            },
            function(path, exclude, filesToFind) {},
            function(path: string, cb) {
                assert.equal(path, "pathtofile");
                return cb(new Error("could not read from fs"));
            });

        try {
            await lcov.load("pathtofile");
            return done(new Error("Expected error did not fire!"));
        } catch(error) {
            if(error.name === "AssertionError") return done(error);
            if(error.message === "could not read from fs") return done();
            return done(error);
        }
    });

    test("#load: Should return a data string", async function(done) {
        const lcov = new Lcov(
            {
                lcovFileName: "test.ts",
                coverageDecorationType: {
                    key: "testKey",
                    dispose() {}
                }
            },
            function(path, exclude, filesToFind) {},
            function(path: string, cb) {
                assert.equal(path, "pathtofile");
                return cb(null, "lcovhere");
            });

        try {
            const dataString = await lcov.load("pathtofile");
            assert.equal(dataString, "lcovhere");
            return done();
        } catch(error) {
            return done(error);
        }
    });
});