# C++ Coverage Example (LLVM-cov JSON)

This example demonstrates generating LLVM coverage in JSON format for a C++ program using Clang and LLVM tools. The code in `src/main.cpp` intentionally contains multi-conditional `if` logic to demonstrate partial coverage, branch details, and region-wise execution counts.

## Toolchain

Install Clang and LLVM tools:

**Debian/Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install -y clang llvm
```

**macOS (Homebrew):**
```bash
brew install llvm
```

**Verify installation:**
```bash
clang++ --version
llvm-cov --version
llvm-profdata --version
```

## Generate LLVM Coverage JSON

LLVM's native coverage export format includes **region-wise execution counts** and detailed branch information for fine-grained coverage analysis.

From this folder (example/cpp):

```bash
# 1) Clean artifacts
rm -rf build && mkdir -p build

# 2) Build with Clang profile instrumentation
clang++ -fprofile-instr-generate -fcoverage-mapping -O0 -g -std=c++17 \
  -c src/main.cpp -o build/main.o
clang++ -fprofile-instr-generate -o build/app build/main.o

# 3) Run with profiling enabled
LLVM_PROFILE_FILE=build/default.profraw ./build/app

# 4) Merge profiling data
llvm-profdata merge -o build/default.profdata build/default.profraw

# 5) Export coverage as JSON
llvm-cov export -format=json -instr-profile=build/default.profdata \
  ./build/app > llvm-cov.json
```

The extension auto-discovers `llvm-cov.json` and displays:
- **Line coverage** (green/yellow/red decorations)
- **Branch coverage** with true/false edge counts (CodeLens + hover)
- **Region-wise execution counts** on hover (column and count per region entry)

## View in VS Code

```bash
code ../../example.code-workspace
```

- Open `src/main.cpp`
- Run command: Coverage Gutters: Watch Coverage and Visible Editors
- Decorations appear (green/yellow/red), hovers show details
