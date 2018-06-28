import {post, RequestCallback} from "request";

export interface IOptions { form?: object; }
export {RequestCallback};
export class Request {
    public post(uri: string, options?: IOptions, callback?: RequestCallback): void {
        post(uri, options, callback);
        return;
    }
}
