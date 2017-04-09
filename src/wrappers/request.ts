import {post} from "request";

export interface Options { form?: Object };

export class Request {
    public post(uri: string, options?: Options): void {
        post(uri, options);
        return;
    }
}
