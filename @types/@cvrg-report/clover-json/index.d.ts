declare namespace parseClover {
    function parseContent(str: string): Promise<Section[]>

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
        branches?: Branches,
        file: string,
        functions: Functions,
        lines: Lines
    }
}

declare module "@cvrg-report/clover-json" {
    export = parseClover;
}
