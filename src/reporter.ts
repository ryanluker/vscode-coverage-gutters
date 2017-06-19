import {Request} from "./wrappers/request";
import {Uuid} from "./wrappers/uuid";

const EXT_NAME = "vscode-coverage-gutters";
const EXT_VERSION = "1.0.0";

export class Reporter {
    private readonly cid: string;
    private readonly enableMetrics: boolean;
    private readonly gaTrackingId: string;
    private readonly request: Request;

    constructor(request: Request, uuid: Uuid, gaTrackingId: string, enableMetrics: boolean) {
        this.gaTrackingId = gaTrackingId;
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
            tid: this.gaTrackingId,
            v: "1",
        };

        return this.request.post("https://www.google-analytics.com/collect", { form: data });
    }
}
