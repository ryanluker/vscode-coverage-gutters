export enum CoverageType {
    NONE,
    LCOV,
    CLOVER,
    COBERTURA,
    JACOCO,
    LLVM,
}

export class CoverageFile {
    public type!: CoverageType;
    private file: string;

    constructor(file: string) {
        this.file = file;
        this.setFileType(this.file);
    }

    /**
     * Takes a data string and looks for indicators of specific files
     * @param file file to detect type information
     */
    private setFileType(file: string) {
        let possibleType = CoverageType.NONE;
        if (
            file.includes("<?xml") &&
            file.includes("<coverage") &&
            file.includes("<project")
        ) {
            possibleType = CoverageType.CLOVER;
        } else if (file.includes("JACOCO")) {
            possibleType = CoverageType.JACOCO;
        } else if (file.includes("<?xml")) {
            possibleType = CoverageType.COBERTURA;
        } else if (file.trim().startsWith("{") || file.trim().startsWith("[")) {
            if (this.isLlvmCovJson(file)) {
                possibleType = CoverageType.LLVM;
            } else if (file !== "") {
                // Some other JSON report, or not JSON at all, so let lcov have a go at it
                possibleType = CoverageType.LCOV;
            }
        } else if (file !== "") {
            possibleType = CoverageType.LCOV;
        }
        this.type = possibleType;
    }

    /**
     * Checks a JSON string for the shapes we know how to parse, either the
     * llvm-cov export (which tags itself in a trailing type field) or the
     * gcovr json report. Anything else is left for the other parsers.
     * https://llvm.org/docs/CoverageMappingFormat.html
     * @param file file to detect type information
     */
    private isLlvmCovJson(file: string): boolean {
        let parsed: unknown;
        try {
            parsed = JSON.parse(file);
        } catch {
            return false;
        }

        if (typeof parsed !== "object" || parsed === null) { return false; }
        const report = parsed as { type?: unknown, data?: unknown, files?: unknown };

        // llvm-cov export tags itself, ie {"type":"llvm.coverage.json.export","version":"2.0.1"}
        if (typeof report.type === "string" && report.type.startsWith("llvm.coverage.json.export")) {
            return true;
        }

        // Older exports predate the type tag, so fall back to the data[].files[] shape
        if (Array.isArray(report.data)) {
            return report.data.some(
                (entry) => !!entry && Array.isArray((entry as { files?: unknown }).files),
            );
        }

        // gcovr json report, ie {"files":[{"file":"main.c","lines":[...]}]}
        if (Array.isArray(report.files)) {
            return report.files.some(
                (entry) => !!entry && typeof (entry as { file?: unknown }).file === "string",
            );
        }

        return false;
    }
}
