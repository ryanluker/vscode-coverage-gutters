# Install

The following steps expects the use of the vscode extension .NET Core Test Explorer.

-   [.NET Core Test Explorer](https://github.com/formulahendry/vscode-dotnet-test-explorer)

## Initial setup of new app using the dotnet CLI

```powershell
dotnet new console -n MyApp -o src
dotnet new xunit -n MyApp.Tests -o test
dotnet add .\test\MyApp.Tests.csproj reference .\src\MyApp.csproj
dotnet add .\test\MyApp.Tests.csproj package coverlet.msbuild
```

## Install the necessary plugins in Visual Studio Code (vscode)

Open the **Extension** menu, then search and install the following extensions:

-   `formulahendry.dotnet-test-explorer`
-   `ryanluker.vscode-coverage-gutters`

## Configure .NET Core Test Explorer to create coverage data

Open up Visual Studio Code's **Settings** window, click on **Extensions** on the list and then **.NET Core Test Explorer** to reach the relevant settings.

-   For **Test Arguments** you need to enter the following string: `/p:CollectCoverage=true /p:CoverletOutputFormat=lcov /p:CoverletOutput=./lcov.info`
-   **Test Project Path** could be configured as follows: `**/*.Tests.csproj`

In json-form, the settings would look like this:

```json
{
    "dotnet-test-explorer.testArguments": "/p:CollectCoverage=true /p:CoverletOutputFormat=lcov /p:CoverletOutput=./lcov.info",
    "dotnet-test-explorer.testProjectPath": "**/*.Tests.csproj"
}
```

## Configure a Visual Studio Code Test Task to create coverage data

If the folder doesn't exist, create a folder called `.vscode` in the root-folder of your project.
Then create a file called `tasks.json` and copy the content below into it:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "test",
            "dependsOn": [],
            "command": "dotnet",
            "type": "process",
            "args": [
                "test",
                "${workspaceFolder}/test/MyApp.Tests.csproj",
                "/p:CollectCoverage=true",
                "/p:CoverletOutputFormat=lcov",
                "/p:CoverletOutput=./lcov.info"
            ],
            "problemMatcher": "$msCompile",
            "group": {
                "kind": "test",
                "isDefault": true
            }
        }
    ]
}
```

**This example only contains a single task to run the test-project and instructions to create the coverage file to make it easier to read.**

## Run the tests and generate the coverage report

- A) Open the new icon in the **Side Bar** named **Testing** _(.NET Core Test Explorer)_ and run the tests.
- B) Or run the newly created task named `test` from the **Command Palette**

When you open any source-files under `src/`, Coverage Gutter will show code coverage.
