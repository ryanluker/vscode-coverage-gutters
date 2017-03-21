import {readFile as readFileFS} from "fs";

export interface FsInterface {
    readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void
}

export class fs implements FsInterface {
    public readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void): void {
        return readFileFS(filename, callback);
    }
}

