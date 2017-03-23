"use strict";

import {LcovSection, source as sourceLcovParse} from "lcov-parse";

export interface LcovParseInterface {
    source(file: string, cb: (err: Error, data: Array<LcovSection>) => void): void;
}

export class lcovParse implements LcovParseInterface {
    public source(file: string, cb: (err: Error, data: Array<LcovSection>) => void): void {
        return sourceLcovParse(file, cb);
    }
}