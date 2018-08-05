import {parseContent as parseContentClover} from "@cvrg-report/clover-json";
import {parseContent as parseContentCobertura} from "cobertura-parse";
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
    public async filesToSections(files: Map<string, string>): Promise<Map<string, Section>> {
        let coverages = new Map<string, Section>();

        for (const file of files) {
            const value = file[1];
            const key = file[0];

            // file is an array
            let coverage = new Map<string, Section>();
            if (
                value.includes("<?xml") &&
                value.includes("<coverage") &&
                value.includes("<project")
            ) {
                coverage = await this.xmlExtractClover(value, key);
            } else if (value.includes("<?xml")) {
                coverage = await this.xmlExtractCobertura(value, key);
            } else {
                coverage = await this.lcovExtract(value);
            }
            // add new coverage map to existing coverages generated so far
            coverages = new Map([...coverages, ...coverage]);
        }

        return coverages;
    }

    private xmlExtractCobertura(xmlFile: string, absolutePath: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            try {
                parseContentCobertura(xmlFile, (err, data) => {
                    if (err) { return reject(err); }
                    // convert the array of sections into an unique map
                    const sections = new Map<string, Section>();
                    data.forEach((section) => {
                        sections.set(section.file, section);
                    });
                    return resolve(sections);
                }, absolutePath);
            } catch (error) {
                return reject(error);
            }
        });
    }

    private async xmlExtractClover(xmlFile: string, absolutePath: string) {
        const data = await parseContentClover(xmlFile);
        // convert the array of sections into an unique map
        const sections = new Map<string, Section>();
        data.forEach((section) => {
            sections.set(section.file, section);
        });
        return sections;
    }

    private lcovExtract(lcovFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            try {
                source(lcovFile, (err, data) => {
                    if (err) { return reject(err); }
                    // convert the array of sections into an unique map
                    const sections = new Map<string, Section>();
                    data.forEach((section) => {
                        sections.set(section.file, section);
                    });
                    return resolve(sections);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }
}
