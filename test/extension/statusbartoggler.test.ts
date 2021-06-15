import * as assert from "assert";
import { StatusBarToggler } from "../../src/extension/statusbartoggler";
import { fakeConfig } from "../mocks/fakeConfig";

suite("Status Bar Toggler Tests", () => {
    test("Should toggle showStatusBarToggler command and message @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) No Coverage");
    });

    test("Should not toggle twice showStatusBarToggler command and message @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) No Coverage");
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) No Coverage");
    });

    test("Should toggle showStatusBarToggler command and message back to \"Watch\" @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) No Coverage");
        statusBarToggler.toggle(false);
        assert.equal(statusBarToggler.statusText, "Watch");
    });

    test("Should show the spinner when setting the `isLoading` status @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.setLoading(true);
        assert.equal(statusBarToggler.statusText, "$(loading~spin) Coverage");
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(loading~spin) Coverage");
        statusBarToggler.setLoading(false);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) No Coverage");
    });

    test("Should show coverage when a number is set @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.toggle(true);
        statusBarToggler.setLoading(false);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) No Coverage");
        statusBarToggler.setCoverage(84);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) 84% Coverage");
        statusBarToggler.setCoverage(undefined);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) No Coverage");
        statusBarToggler.setCoverage(50);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) 50% Coverage");
        statusBarToggler.setCoverage(0);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) 0% Coverage");
    });

    test("Should dispose when asked @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.dispose();
    });
});
