import {parseContent} from "cobertura-parse";
import {Section, source} from "lcov-parse";
import {IConfigStore} from "./config";

export class LcovParser {
    private configStore: IConfigStore;

    constructor(configStore: IConfigStore) {
        this.configStore = configStore;
    }

    /**
     * Extracts coverage sections of type xml and lcov
     * @param files array of coverage files in string format
     */
    public async filesToSections(files: Set<string>): Promise<Map<string, Section>> {
        let coverages = new Map<string, Section>();

        files.forEach(async (file) => {
            let coverage = new Map<string, Section>();
            if (file.includes("<?xml")) {
                coverage = await this.xmlExtract(file);
            } else {
                coverage = await this.lcovExtract(file);
            }
            // add new coverage map to existing coverages generated so far
            coverages = new Map([...coverages, ...coverage]);
        });

        return coverages;
    }

    private xmlExtract(xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            parseContent(xmlFile, (err, data) => {
                if (err) { return reject(err); }
                // convert the array of sections into an unique map
                const sections = new Map<string, Section>();
                data.forEach((section) => {
                    sections.set(section.file, section);
                });
                return resolve(sections);
            });
        });
    }

    private lcovExtract(lcovFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            source(lcovFile, (err, data) => {
                if (err) { return reject(err); }
                // convert the array of sections into an unique map
                const sections = new Map<string, Section>();
                data.forEach((section) => {
                    sections.set(section.file, section);
                });
                return resolve(sections);
            });
        });
    }
}
