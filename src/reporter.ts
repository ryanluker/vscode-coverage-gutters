import {Uuid} from "./wrappers/uuid";
import {Request} from "./wrappers/request";

const GA_TRACKING_ID = ""; // add before a release;
const EXT_NAME = "vscode-coverage-gutters";
const EXT_VERSION = "0.4.0";

export class Reporter {
    private readonly cid: string;
    private readonly enableMetrics: boolean;
    private readonly request: Request;

    constructor(request: Request, uuid: Uuid, enableMetrics: boolean) {
        this.request = request;
        this.cid = uuid.get();
        this.enableMetrics = enableMetrics;
    }

    public sendEvent(
        category: string,
        action: string,
        label?: string,
        value?: number,
    ) {
        if (!this.enableMetrics) { return; }
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

        return this.request.post("https://www.google-analytics.com/collect", { form: data });
    }
}
