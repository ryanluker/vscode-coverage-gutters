import {readFile as readFileFS} from "fs";

export function readFile(filename: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void) {
    return readFileFS(filename, callback);
}