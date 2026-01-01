# C Coverage Example (single-file)

This example demonstrates generating Cobertura XML coverage (`coverage.xml`) for a C program using GCC and `gcovr`. The code in `src/main.c` intentionally contains multi-conditional `if` logic to demonstrate partial and full coverage.

## Toolchain

Install GCC and gcovr on your machine:

- Debian/Ubuntu
```bash
sudo apt-get update
sudo apt-get install -y gcc gcovr
```

- macOS (Homebrew)
```bash
brew install gcc gcovr
```

Verify:
```bash
gcovr --version
gcc --version
```

## Generate Coverage (Cobertura XML)

From this folder (example/c):
```bash
# 1) Clean artifacts
rm -rf build && mkdir -p build

# 2) Build with GCC and gcov instrumentation
gcc -O0 -g -std=c11 -fprofile-arcs -ftest-coverage -c src/main.c -o build/main.o
gcc -fprofile-arcs -ftest-coverage -o build/app build/main.o

# 3) Run program to produce .gcda
./build/app

# 4) Generate Cobertura XML using gcovr
gcovr \
    --root . \
    --object-directory build \
    --xml -o build/coverage.xml

# (Optional) HTML report
gcovr --root . --object-directory build --html-details -o build/coverage.html
```

The Coverage Gutters extension will automatically discover `coverage.xml` (Cobertura format).

## View in VS Code

```bash
code ../../example.code-workspace
```

- Open `src/main.c`
- Run command: Coverage Gutters: Watch Coverage and Visible Editors
- Decorations appear (green/yellow/red), hovers show details

## Expected Coverage Display

After generating `build/coverage.xml` and opening in VS Code:

- **Green indicators** (✓ Fully covered): fully covered lines/branches
- **Yellow indicators** (⚠ Partial coverage): lines with partial branch coverage
- **Red indicators** (✗ Not covered): lines or branches not executed
