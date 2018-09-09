## 2.2.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/19?closed=1)

### New Features:
- Java support via jacoco #163

### Under the hood:
- Update extension integrations to 2.0 #164

### Bugs:
- #150 #160

## 2.1.1
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/18?closed=1)

### Under the hood:
- cleanup relative path comparison from last release #159

### Bugs:
- #154 #157 #155

## 2.1.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/16?closed=1)

### Features:
- php support via clover-json and xml files! #140 #141

### Under the hood:
- use relative path comparison instead of score based #148 #152

### Bugs:
- removed score based file matching which cleans up alot of issues #150 #137

## 2.0.1
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/16?closed=1)

### Under the hood:
- event metrics to better understand language usage #134
- misc project tidying and cleanup #135 #136

### Bugs:
- xml path issue related to upstream parser fixed #133

## 2.0.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/15?closed=1)

### Features:
- Architecture Revamp: focus on caching and performance #117

### Under the hood:
- Module: Revamp gutters / core loop into new CoverageService #116
- Module: Revamp Coverage into LcovParser #115
- Module: Revamp Coverage Renderer #114
- Module: Revamp extension setup and initialization #118
- Module: Revamp File Loader #127
- Update dependencies #110
- Update documentation and readme #111

### Bugs:
- Donate link doesnt have svg in readme in extension search #128
- It doesnt live reload on icov update when 2 panes #109

## 1.3.1
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/14?closed=1)

### Bugs Fixed
- Multi root workspace 100% cpu issue
- Windows xml support issue with cobertura
- Misc bugs related to code execution

## 1.3.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/13?closed=1)

### Features
- Multi Workspace support for extension

### Misc
- Add new readme content
- Add quick pick items for multiple file paths
- Update extension info

## 1.2.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/12?closed=1)

### Features
- xml lcov file support, full and no line coverage reporting with all existing options (no partial at this time)

### Misc
- Add new readme content
- Update changelog file
- Update extension info, add xml coverage file support feature

## 1.1.3
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/11?closed=1)
- fix bug where dots in file path would prevent lcov finding

## 1.1.2
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/10?closed=1)
- fix bug regarding break points and coverage extension
- cleanup preview feature media
- cleanup analytics event naming

## 1.1.1
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/9?closed=1)
- fixed a critical issue with the lcov report preview for unix type systems

## 1.1.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/8?closed=1)
- allow multiple lcov files and choose between them with a picker
- preview lcov report html files inside vscode
- cleanup outstanding errors and bugs (parse string, document undefined)
- update readme info
- update readme badges

## 1.0.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/7?closed=1)
- cleanup readme and add a buy me a coffee button (donate)
- updated dark theme colours and icons
- show gutters only show option on by default, added metrics for learning
- added more test coverage to config component
- added customization option for the status bar toggler
- fixed a bug related to excluding files in vscode and having the extension not be able to find the lcov file

## 0.6.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/6?closed=1)
- added statusbar action button
- combined watch editors and watch coverage into one command
- added a remove watchers command
- refactored gutters to use dependency injection
- cleanup tests and add new ones

## 0.5.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/5?closed=1)
- added file watch and render feature
- added metrics for vscodeVersion
- use environment variables for ga tracking id
- cleanup tests

## 0.4.0
[Github Milestone](https://github.com/ryanluker/vscode-coverage-gutters/milestone/4?closed=1)
- added keybindings and shortcuts
- added metrics
- added options to display only gutter, line or ruler (or combo)
- display errors and no coverage in message popup

## 0.3.0
- added lcov watch functionality
- added enhanced lcov coverage (full, partial and none options)

## 0.2.1
- added option to use relative path comparison
- fixed changelog link
- increase test coverage

## 0.2.0
- true gutter indicators
- contribution doc
- refactor gutters to be more testable

## 0.1.3
- colour updates
- context menu additions
- icon resizing

## 0.1.2
- minor doc tweaks
- cleanup default colours and use rgba

## 0.1.1
- give the icon a background

## 0.1.0
- display and remove lcov line coverage using commands
- modify highlight colour using workspace settings
- modify lcov name using workspace settings
