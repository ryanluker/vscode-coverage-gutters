import {workspace} from "vscode";
import {Section, source} from "lcov-parse";
import {parseContent} from "cobertura-parse";
import {IConfigStore as ConfigStore} from "./config";

export class LcovParser {
    private configStore: ConfigStore;

    constructor(configStore: ConfigStore) {
        this.configStore = configStore;
    }

    /**
     * Extracts coverage sections of type xml and lcov
     * @param files array of coverage files in string format
     */
    public async filesToSections(files: Array<string>): Promise<Set<Section>> {
        let coverages = new Set<Section>();

        files.forEach(async (file) => {
            let coverage = new Set<Section>();
            if (file.includes("<?xml")) {
                coverage = await this.xmlExtract(file);
            } else {
                coverage = await this.lcovExtract(file);
            }
            // add new coverage set to existing coverages generated so far
            coverages = new Set([...coverages, ...coverage]);
        });

        return coverages;
    }

    private xmlExtract(xmlFile: string) {
        return new Promise<Set<Section>>((resolve, reject) => {
            parseContent(xmlFile, (err, data) => {
                if (err) { return reject(err); }
                // convert the array of sections into an unique set
                const sections = new Set<Section>();
                data.forEach(sections.add);
                return resolve(sections);
            });
        });
    }

    private lcovExtract(lcovFile: string) {
        return new Promise<Set<Section>>((resolve, reject) => {
            source(lcovFile, (err, data) => {
                if (err) { return reject(err); }
                // convert the array of sections into an unique set
                const sections = new Set<Section>();
                data.forEach(sections.add);
                return resolve(sections);
            });
        });
    }
}