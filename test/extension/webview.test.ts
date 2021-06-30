import { expect } from "chai";
import { PreviewPanel } from "../../src/extension/webview";

suite("Preview panel Tests", () => {
    test("Should append content security policy to preview HTML when head tag present @unit", () => {
        const reportWithHeadTag = `
            <!doctype html>
            <html lang="en">
            <head>
                <title>Code coverage report for node/</title>
                <link rel="stylesheet" href="../prettify.css" />
                <link rel="stylesheet" href="../base.css" />
            </head>
            </html>
        `;
        const previewPanel = new PreviewPanel(reportWithHeadTag);
        const securityPolicyHeader = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';">\n`;

        const textIncludesPolicy = previewPanel.addContentSecurityPolicy(reportWithHeadTag);

        expect(textIncludesPolicy).to.include(securityPolicyHeader);
    });

    test("Should append content security policy to preview HTML when meta tag present @unit", () => {
        const reportWithMetaTag = `
            <!doctype html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Code coverage report for node/</title>
                <link rel="stylesheet" href="../prettify.css" />
                <link rel="stylesheet" href="../base.css" />
            </head>
            </html>
        `;
        const previewPanel = new PreviewPanel(reportWithMetaTag);
        const securityPolicyHeader = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';">\n`;

        const textIncludesPolicy = previewPanel.addContentSecurityPolicy(reportWithMetaTag);

        expect(textIncludesPolicy).to.include(securityPolicyHeader);
    });

    test("Should append content security policy to preview HTML without head nor meta tags @unit", () => {
        const reportWithoutTags = `
            <!doctype html>
            <html lang="en">
                <title>Code coverage report for node/</title>
                <link rel="stylesheet" href="../prettify.css" />
                <link rel="stylesheet" href="../base.css" />
            </html>
        `;
        const previewPanel = new PreviewPanel(reportWithoutTags);
        const securityPolicyHeader = `<meta http-equiv="Content-Security-Policy" content="default-src 'none';">\n`;

        const textIncludesPolicy = previewPanel.addContentSecurityPolicy(reportWithoutTags);

        expect(textIncludesPolicy).to.include(securityPolicyHeader);
    });
});
