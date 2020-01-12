declare namespace parse {
    function parseContent(
        str: string,
        cb: (err: Error, data: Array<Section>) => void,
        absPath: boolean
    ): void

    interface LineDetail {
        hit: number,
        line: number
    }

    interface BranchDetail {
        block: number,
        branch: number,
        line: number,
        taken: number
    }

    interface FunctionDetail {
        hit: number,
        line: number,
        name: string
    }

    interface Lines {
        details: Array<LineDetail>,
        hit: number,
        found: number
    }

    interface Branches {
        details: Array<BranchDetail>,
        hit: number,
        found: number
    }

    interface Functions {
        details: Array<FunctionDetail>,
        hit: number,
        found: number
    }

    interface Section {
        title?: string,
        branches?: Branches,
        file: string,
        functions: Functions,
        lines: Lines
    }
}

declare module "cobertura-parse" {
    export = parse;
}
