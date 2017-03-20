"use strict";

import {LcovSection, source} from "lcov-parse";

export function lcovParse(file: string, cb: (err: Error, data: Array<LcovSection>) => void): void {
    return source(file, cb);
}