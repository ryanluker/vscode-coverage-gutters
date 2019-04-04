export enum CoverageType {
    NONE,
    LCOV,
    CLOVER,
    COBERTURA,
    JACOCO,
}

export class CoverageFile {
    public type: CoverageType;
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
        } else if (file !== "") {
            possibleType = CoverageType.LCOV;
        }
        this.type = possibleType;
    }
}
