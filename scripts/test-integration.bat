@echo off
setlocal

if not "%APPVEYOR%" == "" (
	set ELECTRON_RUN_AS_NODE=
)

:: Integration Tests
.\scripts\code.bat %~dp0\..\test --extensionDevelopmentPath=%~dp0\..\ --extensionTestsPath=%~dp0\..\out\test

endlocal