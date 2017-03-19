'use strict';
import {configStore} from "./config";

export interface lcov {
    find(): Promise<string>,
    load(lcovPath: string): Promise<string>
}

export class Lcov implements lcov {
    private configStore: configStore;
    private findFiles;
    private readFile;

    constructor(configStore: configStore, findFiles, readFile) {
        this.configStore = configStore;
        this.findFiles = findFiles;
        this.readFile = readFile;
    }

    public find(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.findFiles("**/" + this.configStore.lcovFileName, "**/node_modules/**", 1)
                .then((uriLcov) => {
                    if(!uriLcov.length) return reject(new Error("Could not find a lcov file!"));
                    return resolve(uriLcov[0].fsPath);
                });
        });
    }

    public load(lcovPath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.readFile(lcovPath, (err, data) => {
                if(err) return reject(err);
                return resolve(data.toString());
            });
        });
    }
}