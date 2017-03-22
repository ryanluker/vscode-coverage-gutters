'use strict';
import {configStore} from "./config";
import {VscodeInterface} from "./wrappers/vscode";
import {FsInterface} from "./wrappers/fs";

export interface lcov {
    find(): Promise<string>;
    load(lcovPath: string): Promise<string>;
}

export class Lcov implements lcov {
    private configStore: configStore;
    private vscode: VscodeInterface;
    private fs: FsInterface;

    constructor(
        configStore: configStore,
        vscode: VscodeInterface,
        fs: FsInterface
    ) {
        this.configStore = configStore;
        this.vscode = vscode;
        this.fs = fs;
    }

    public find(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.vscode.findFiles("**/" + this.configStore.lcovFileName, "**/node_modules/**", 1)
                .then((uriLcov) => {
                    if(!uriLcov.length) return reject(new Error("Could not find a lcov file!"));
                    return resolve(uriLcov[0].fsPath);
                });
        });
    }

    public load(lcovPath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.fs.readFile(lcovPath, (err, data) => {
                if(err) return reject(err);
                return resolve(data.toString());
            });
        });
    }
}