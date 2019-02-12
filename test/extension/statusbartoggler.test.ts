import * as assert from "assert";
import { StatusBarToggler } from "../../src/extension/statusbartoggler";
import { fakeConfig } from "../mocks/fakeConfig";

suite("Status Bar Toggler Tests", () => {
    test("Should toggle showStatusBarToggler command and message @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Watch");
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Remove Watch");
    });

    test("Should not toggle twice showStatusBarToggler command and message @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Watch");
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Remove Watch");
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Remove Watch");
    });

    test("Should toggle showStatusBarToggler command and message back to \"Watch\" @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Watch");
        statusBarToggler.toggle(true);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Remove Watch");
        statusBarToggler.toggle(false);
        assert.equal(statusBarToggler.statusText, "$(list-ordered) Watch");
    });

    test("Should dispose when asked @unit", () => {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.dispose();
    });
});
