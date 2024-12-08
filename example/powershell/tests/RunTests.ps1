$configuration = New-PesterConfiguration
$configuration.Run.Path = "$PSScriptRoot"
$configuration.CodeCoverage.Enabled = $true
$configuration.CodeCoverage.Path = "$PSScriptRoot\..\src"
$configuration.CodeCoverage.OutputFormat = 'CoverageGutters'
$configuration.CodeCoverage.OutputPath = "$PSScriptRoot\..\src\coverage.xml"

Invoke-Pester -Configuration $configuration