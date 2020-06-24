import {post} from "request";

const EXT_NAME = "vscode-coverage-gutters";
const EXT_VERSION = "2.4.4";

export class Reporter {
    private readonly cid: string;
    private readonly enableMetrics: boolean;
    private gaTrackingId: string;

    constructor(machineId: string, enableMetrics: boolean) {
        this.gaTrackingId = "";
        this.cid = machineId;
        this.enableMetrics = enableMetrics;
    }

    public sendEvent(
        category: string,
        action: string,
        label?: string,
        value: number = 0,
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

        return post("https://www.google-analytics.com/collect", { form: data }, (err) => {
            if (err) {
                console.error(err.message);
            }
        });
    }
}
