import {parseContent as parseContentClover} from "@cvrg-report/clover-json";
import {parseContent as parseContentCobertura} from "cobertura-parse";
import {parseContent as parseContentJacoco} from "jacoco-parse";
import {Section, source} from "lcov-parse";
import {OutputChannel} from "vscode";
import {IConfigStore} from "./config";
import {Reporter} from "./reporter";

export class LcovParser {
    private configStore: IConfigStore;
    private outputChannel: OutputChannel;
    private eventReporter: Reporter;

    constructor(
        configStore: IConfigStore,
        outputChannel: OutputChannel,
        eventReporter: Reporter,
    ) {
        this.configStore = configStore;
        this.outputChannel = outputChannel;
        this.eventReporter = eventReporter;
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
                coverage = await this.xmlExtractClover(value);
            } else if (value.includes("JACOCO")) {
                coverage = await this.xmlExtractJacoco(value);
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
                    this.eventReporter.sendEvent("system", "xmlExtractCobrtura-success");
                    return resolve(sections);
                }, absolutePath);
            } catch (error) {
                this.handleError("cobertura-parse", error);
                return resolve(new Map<string, Section>());
            }
        });
    }

    private xmlExtractJacoco(xmlFile: string) {
        return new Promise<Map<string, Section>>((resolve, reject) => {
            try {
                parseContentJacoco(xmlFile, (err, data) => {
                    if (err) { return reject(err); }
                    // convert the array of sections into an unique map
                    const sections = new Map<string, Section>();
                    data.forEach((section) => {
                        sections.set(section.file, section);
                    });
                    this.eventReporter.sendEvent("system", "xmlExtractJacoco-success");
                    return resolve(sections);
                });
            } catch (error) {
                this.handleError("jacoco-parse", error);
                return resolve(new Map<string, Section>());
            }
        });
    }

    private async xmlExtractClover(xmlFile: string) {
        try {
            const data = await parseContentClover(xmlFile);
            // convert the array of sections into an unique map
            const sections = new Map<string, Section>();
            data.forEach((section) => {
                sections.set(section.file, section);
            });
            this.eventReporter.sendEvent("system", "xmlExtractClover-success");
            return sections;
        } catch (error) {
            this.handleError("clover-parse", error);
            return new Map<string, Section>();
        }
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
                    this.eventReporter.sendEvent("system", "lcovExtract-success");
                    return resolve(sections);
                });
            } catch (error) {
                this.handleError("lcov-parse", error);
                return resolve(new Map<string, Section>());
            }
        });
    }

    private handleError(parserName: string, error: Error) {
        const message = error.message ? error.message : error;
        const stackTrace = error.stack;
        this.outputChannel.appendLine(
            `[${Date.now()}][lcovparser][${parserName}]: Error: ${message}`);
        this.outputChannel.appendLine(
            `[${Date.now()}][lcovparser][${parserName}]: Stacktrace: ${stackTrace}`);
        this.eventReporter.sendEvent("system", `${parserName}-error`, `${stackTrace}`);
    }
}
