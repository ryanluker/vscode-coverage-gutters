import {Section, source as sourceLcovParse} from "lcov-parse";

export interface InterfaceLcovParse {
    source(file: string, cb: (err: Error, data: Section[]) => void): void;
}

export class LcovParse implements InterfaceLcovParse {
    public source(file: string, cb: (err: Error, data: Section[]) => void): void {
        return sourceLcovParse(file, cb);
    }
}
