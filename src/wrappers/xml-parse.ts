import {Section, parseContent} from "cobertura-parse";

export interface InterfaceXmlParse {
    parseContent(file: string, cb: (err: Error, data: Section[]) => void): void;
}

export class XmlParse implements InterfaceXmlParse {
    public parseContent(file: string, cb: (err: Error, data: Section[]) => void): void {
        return parseContent(file, cb);
    }
}
