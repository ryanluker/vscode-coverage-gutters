import { expect } from "chai";
import fs, { PathLike } from "fs";
import sinon from "sinon";
import * as vscode from "vscode";

import {Coverage} from "../../src/coverage-system/coverage";
import {Config} from "../../src/extension/config";

const stubConfig = sinon.createStubInstance(Config) as Config;

suite("Coverage Tests", () => {
    teardown(() => sinon.restore());

    test("Constructor should setup properly @unit", () => {
        expect(() => {
            new Coverage(stubConfig);
        }).not.to.throw();
    });

    test("#load: Should reject when readFile returns an error @unit", async () => {
        sinon.stub(fs, "readFile").callsFake(() => {
            throw new Error("could not read from fs");
        });

        const coverage = new Coverage(
            stubConfig,
        );

        try {
            await coverage.load("pathtofile");
        } catch (e: any) {
            expect(e.message).to.equal("could not read from fs");
        }
    });

    test("#load: Should return a data string @unit", async () => {
        const stubReadFile = sinon.stub(fs, "readFile").callsFake(
            (_: number | PathLike, cb: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
                return cb(undefined as any, Buffer.from("lcovhere"));
            },
        );

        const coverage = new Coverage(
            stubConfig,
        );

        const path = "pathtofile";
        const dataString = await coverage.load(path);
        expect(dataString).to.equal("lcovhere");
        expect(stubReadFile).to.be.calledWith(path);
    });

    test("#pickFile: Should return undefined if no item is picked @unit", async () => {

        sinon.stub(vscode.window, "showQuickPick").resolves(undefined);
        const stubWarningMessage = sinon.stub(vscode.window, "showWarningMessage");

        const coverage = new Coverage(
            stubConfig,
        );

        await coverage.pickFile(["test1", "test2"], "nope");
        expect(stubWarningMessage).to.be.calledWith("Did not choose a file!");
    });

    test("#pickFile: Should return string if filePaths is a string @unit", async () => {
        const coverage = new Coverage(
            stubConfig,
        );

        const value = await coverage.pickFile("123", "nope");

        expect(value).to.equal("123");
    });

    test("#pickFile: Should return string if filePaths is an array with one value @unit", async () => {
        const coverage = new Coverage(
            stubConfig,
        );

        const value = await coverage.pickFile(["123"], "nope");
        expect(value).to.equal("123");
    });
});
