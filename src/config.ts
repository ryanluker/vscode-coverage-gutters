'use strict';

import {TextEditorDecorationType} from "vscode";

export interface configStore {
    lcovFileName: string,
    coverageDecorationType: TextEditorDecorationType
}

export class Config {
    private createTextEditorDecorationType;
    private executeCommand;
    private workspaceConfig

    private lcovFileName;
    private coverageDecorationType;

    constructor(
        createTextEditorDecorationType,
        executeCommand,
        workspaceConfig
    ) {
        this.createTextEditorDecorationType = createTextEditorDecorationType;
        this.executeCommand = executeCommand;
        this.workspaceConfig = workspaceConfig;
    }

    public get(): configStore {
        return {
            lcovFileName: this.lcovFileName,
            coverageDecorationType: this.coverageDecorationType
        }
    }

    public setup(): configStore {
        //Customizable UI configurations
        const rootCustomConfig = this.workspaceConfig("coverage-gutters.customizable");
        const configsCustom = Object.keys(rootCustomConfig);
        for(let element of configsCustom) {
            this.executeCommand(
                "setContext",
                "config.coverage-gutters.customizable." + element,
                rootCustomConfig.get(element));
        }

        //Basic configurations
        const rootConfig = this.workspaceConfig("coverage-gutters");
        this.lcovFileName = rootConfig.get("lcovname") as string;
        const coverageLightBackgroundColour = rootConfig.get("highlightlight") as string;
        const coverageDarkBackgroundColour = rootConfig.get("highlightdark") as string;

        this.coverageDecorationType = this.createTextEditorDecorationType({
            isWholeLine: true,
            light: {
                backgroundColor: coverageLightBackgroundColour
            },
            dark: {
                backgroundColor: coverageDarkBackgroundColour
            }
        });

        return this.get();
    }
}