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
    public async filesToSections(files: Map<string, string>): Promise<Map<string, Section>> {
        let coverages = new Map<string, Section>();

        for (const file of files) {
            const value = file[1];
            const key = file[0];

            // file is an array
            let coverage = new Map<string, Section>();
            if (value.includes("<?xml")) {
                coverage = await this.xmlExtract(value, key);
            } else {
                coverage = await this.lcovExtract(value);
            }
            // add new coverage map to existing coverages generated so far
            coverages = new Map([...coverages, ...coverage]);
        }

        return coverages;
    }

    private xmlExtract(xmlFile: string, absolutePath: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            try {
                parseContent(xmlFile, (err, data) => {
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
