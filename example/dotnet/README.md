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

## Configure .NET Core Test Explorer

Open up Visual Studio Code's **Settings** window, click on **Extensions** on the list and then **.NET Core Test Explorer** to reach the relevant settings.

-   For **Test Arguments** you need to enter the following string: `/p:CollectCoverage=true /p:CoverletOutputFormat=lcov /p:CoverletOutput=./lcov.info`
-   **Test Project Path** could be configured as follows: `test/*.Tests.csproj`

In json-form, the settings would look like this:

```json
{
    "dotnet-test-explorer.testArguments": "/p:CollectCoverage=true /p:CoverletOutputFormat=lcov /p:CoverletOutput=./lcov.info",
    "dotnet-test-explorer.testProjectPath": "test/*.Tests.csproj"
}
```

## Run the tests and generate the coverage report

Open the new icon for **Testing** _(.NET Core Test Explorer)_ and run the tests.
When you open any source-files under `src/`, Coverage Gutter will show code coverage.
