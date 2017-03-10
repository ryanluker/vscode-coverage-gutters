'use strict';

import * as parse from "lcov-parse";

export class Gutters {
    private indicators: Object[];

    constructor() {
        this.indicators = [];
    }

    getIndicators(): Object[] {
        return this.indicators;
    }

    displayCoverageForFile(file: string) {
        console.log(file);
    }

    dispose() {
        //unrender coverage indicators
    }
}