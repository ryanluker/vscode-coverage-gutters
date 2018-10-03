import {StatusBarToggler} from "../../src/extension/statusbartoggler";
import { fakeConfig } from "../fakeConfig.test";

suite("Status Bar Toggler Tests", function() {
    test("Should toggle showStatusBarToggler command and message @unit", function() {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.toggle();
    });

    test("Should dispose when asked @unit", function() {
        const statusBarToggler = new StatusBarToggler(fakeConfig);
        statusBarToggler.dispose();
    });
});
