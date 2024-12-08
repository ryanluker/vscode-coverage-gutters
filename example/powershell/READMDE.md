# Install

## Required Powershell Modules

In order to run 'Pester'-Tests please install the Pester module from PSGallery: [https://www.powershellgallery.com/packages/Pester](https://www.powershellgallery.com/packages/Pester)

```powershell
Install-Module -Name Pester
```

## Install the necessary plugins in Visual Studio Code (vscode)

Open the **Extension** menu, then search and install the following extensions:

-   `ms-vscode.powershell`
-   `pspester.pester-test`
-   `ryanluker.vscode-coverage-gutters`

# Test

Execute the _tests\RunTests.ps1_ file to execute the present Pester tests (i.e. _Calendar.Tests.ps1_) which will create the _src\coverage.xml_ file.
Open _src\Appointment.psm1_ or _src\Calendar.psm1_ to check the code coverage.
