import {ICoverageLines} from "./renderer";

const lastCoverageLines: ICoverageLines = {
    full: [],
    none: [],
    partial: [],
};

function emptyLastCoverage() {
    lastCoverageLines.full = [];
    lastCoverageLines.none = [];
    lastCoverageLines.partial = [];
}

export function setLastCoverageLines(coverageLines: ICoverageLines) {
    lastCoverageLines.full = coverageLines.full;
    lastCoverageLines.none = coverageLines.none;
    lastCoverageLines.partial = coverageLines.partial;
}

/**
 * Pulling the last coverage lines sets the struct back to empty
 */
export function getLastCoverageLines(): ICoverageLines {
    const pullCoverageLines = lastCoverageLines;
    // clean out last coverage after consumption
    emptyLastCoverage();
    return pullCoverageLines;
}
