import {post} from "request";
import {v4 as uuid} from "uuid";

const GA_TRACKING_ID = "" //add before a release;
const EXT_NAME = "vscode-coverage-gutters";
const EXT_VERSION = "0.3.0";

export class Reporter {
    private readonly cid: string;

    constructor() {
        this.cid = uuid();
    }

    public sendEvent(
        category: string,
        action: string,
        label?: string,
        value?: number,
    ) {
        const data = {
            an: EXT_NAME,
            av: EXT_VERSION,
            cid: this.cid,
            ea: action,
            ec: category,
            el: label,
            ev: value,
            t: "event",
            tid: GA_TRACKING_ID,
            v: "1",
        };

        return post("https://www.google-analytics.com/collect", { form: data });
    }
}
