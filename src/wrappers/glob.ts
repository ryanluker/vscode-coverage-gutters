import * as glob from "glob";

export interface InterfaceGlob {
    find(pattern: string, options: glob.IOptions, cb: (err: Error, matches: string[]) => void);
}

export class Glob implements InterfaceGlob {
    public find(pattern: string, options: glob.IOptions, cb: (err: Error, matches: string[]) => void) {
        return glob(pattern, options, cb);
    }
}
