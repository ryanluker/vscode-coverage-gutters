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
    }

    public async createWebView() {
        // Read in the report html and send it to the webview
        const reportUri = Uri.file(this.pickedReport);
        const reportHtml = await workspace.openTextDocument(reportUri);
        const reportHtmlWithPolicy = this.addContentSecurityPolicy(reportHtml.getText());

        // Construct the webview panel for the coverage report to live in
        this.previewPanel = window.createWebviewPanel(
            "coverageReportPreview",
            "Preview Coverage Report",
            ViewColumn.One,
        );

        this.previewPanel.webview.html = reportHtmlWithPolicy;
    }

    public dispose() {
        this.previewPanel.dispose();
    }

    public addContentSecurityPolicy(text: string): string {
        const securityPolicyHeader = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';">\n`;
        let tag = text.indexOf("<meta");

        if (tag < 0) {
            tag = text.indexOf("</head");
        }

        const newText = `${text.substring(0, tag)}${securityPolicyHeader}${text.substring(tag)}`;

        return newText;
    }
}
