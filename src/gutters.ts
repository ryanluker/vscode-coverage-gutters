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

    removeIndicators() {
        //unrender coverage indicators
    }
}