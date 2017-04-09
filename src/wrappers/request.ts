import {post} from "request";

export interface Options { form?: Object };

export class Request {
    public post(uri: string, options?: Options) {
        return post(uri, options);
    }
}
