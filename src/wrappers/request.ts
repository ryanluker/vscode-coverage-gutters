import {post} from "request";

export interface IOptions { form?: object; }

export class Request {
    public post(uri: string, options?: IOptions): void {
        post(uri, options);
        return;
    }
}
