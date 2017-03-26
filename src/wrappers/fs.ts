import {readFile as readFileFS} from "fs";

export interface InterfaceFs {
    readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void;
}

export class Fs implements InterfaceFs {
    public readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void {
        return readFileFS(filename, callback);
    }
}
