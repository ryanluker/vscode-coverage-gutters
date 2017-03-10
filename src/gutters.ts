'use strict';

import * as parse from "lcov-parse";
import {readFile} from "fs";

export class Gutters {
    private indicators: Object[];
    private lcovFile: string;
    private workspacePath: string;
    private lcovPath: string;

    constructor(workspacePath: string) {
        this.indicators = [];
        this.workspacePath = workspacePath;
        this.lcovPath = this.workspacePath + "/coverage/lcov.info";
    }

    public async displayCoverageForFile(file: string) {
        let lcovFile = await this.loadLcov();
        let coveredLines = await this.findFileAndExtractCoverage(lcovFile, file);
    }

    public dispose() {
        //unrender coverage indicators
    }

    public getLcovPath(): string {
        return this.lcovPath;
    }

    public getWorkspacePath(): string {
        return this.workspacePath;
    }

    public getIndicators(): Object[] {
        return this.indicators;
    }

    private loadLcov() {
        return new Promise<string>((resolve, reject) => {
            readFile(this.lcovPath, (err, data) => {
                if(err) return reject(err);
                return resolve(data.toString());
            });
        });
    }

    private findFileAndExtractCoverage(lcovFile: string, file: string): Promise<Array<Detail>> {
        return new Promise<Array<Detail>>((resolve, reject) => {
            parse(lcovFile, (err, data) => {
                if(err) return reject(err);
                let section = data.find((section) => {
                    const relativePath = file.split(this.workspacePath)[1];
                    return section.file === relativePath
                });

                if(!section) return resolve();
                return resolve(section.lines.details);
            });
        });
    }
}