import {
    Uri,
    ViewColumn,
    WebviewPanel,
    window,
    workspace,
} from "vscode";

export class PreviewPanel {
    private pickedReport: string;
    private previewPanel: WebviewPanel;

    constructor(pickedReport: string) {
        this.pickedReport = pickedReport;
        // Construct the webview panel for the coverage report to live in
        this.previewPanel = window.createWebviewPanel(
            "coverageReportPreview",
            "Preview Coverage Report",
            ViewColumn.One,
        );
    }

    public async createWebView() {
        // Read in the report html and send it to the webview
        const reportUri = Uri.file(this.pickedReport);
        const reportHtml = await workspace.openTextDocument(reportUri);
        const reportHtmlWithPolicy = this.addContentSecurityPolicy(reportHtml.getText());

        this.previewPanel.webview.html = reportHtmlWithPolicy;
    }

    private addContentSecurityPolicy(text: string) {
        const meta = text.indexOf("<meta");
        const securityPolicyHeader = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';">`;

        const newText = `${text.substring(0, meta)}${securityPolicyHeader}${text.substring(meta)}`;

        return newText;
    }
}
