import {v4} from "uuid";

export class Uuid {
    public get(): string {
        return v4();
    }
}
