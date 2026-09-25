# Rust Coverage Example

This is an example Rust project demonstrating how to generate test coverage reports and use them with the Coverage Gutters VS Code extension.

## Prerequisites

- Rust and Cargo installed
- `cargo-tarpaulin` for coverage reporting (install with `cargo install cargo-tarpaulin`)

## Generating Coverage Reports

### Using Tarpaulin (Recommended)

Tarpaulin is the most popular code coverage tool for Rust. It can generate coverage in multiple formats:

#### LLVM JSON format (used by this extension):
```bash
cargo tarpaulin --out Json --output-dir .
```

This creates a `cobertura.json` file in the current directory.

#### HTML Report:
```bash
cargo tarpaulin --out Html
```

#### Cobertura XML:
```bash
cargo tarpaulin --out Xml
```

### Using Cargo's Built-in Coverage

Requires nightly Rust:
```bash
rustup default nightly
RUSTFLAGS="-C instrument-coverage" LLVM_PROFILE_FILE="coverage-%p-%m.profraw" cargo test --no-default-features
```

## Running Tests

```bash
cargo test
```

## Viewing Coverage in VS Code

1. Generate coverage using one of the methods above
2. Open this project in VS Code
3. Use Coverage Gutters commands:
   - `Coverage Gutters: Display Coverage` - Shows covered lines
   - `Coverage Gutters: Watch Coverage` - Auto-updates when coverage files change

## Project Structure

- `src/lib.rs` - Library with mathematical functions and comprehensive tests
- `src/main.rs` - Binary example using the library functions
- `Cargo.toml` - Project configuration

## Coverage Tools

The Rust ecosystem has several coverage tools:
- **cargo-tarpaulin**: Platform-independent, works on Linux, Windows, and macOS (Recommended)
- **cargo-llvm-cov**: Uses LLVM's coverage instrumentation (requires LLVM tools)
- **grcov**: Works with coverage data from various sources

## More Information

- [Cargo Tarpaulin Documentation](https://github.com/xd009642/tarpaulin)
- [Rust Book - Testing](https://doc.rust-lang.org/book/ch11-00-testing.html)
