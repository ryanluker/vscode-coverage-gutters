import {ICoverageLines} from "./renderer";

const lastCoverageLines: ICoverageLines = {
    full: [],
    none: [],
    partial: [],
};

export function setLastCoverageLines(coverageLines: ICoverageLines) {
    lastCoverageLines.full = coverageLines.full;
    lastCoverageLines.none = coverageLines.none;
    lastCoverageLines.partial = coverageLines.partial;
}

export function getLastCoverageLines(): ICoverageLines {
    return lastCoverageLines;
}
