declare function parse(file: string, cb: (err: Error, data: Object) => void): void

declare namespace parse {
    function source(str: string, cb: (err: Error, data: Object) => void)
}

declare module "lcov-parse" {
    export = parse;
}