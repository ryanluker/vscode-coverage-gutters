# Ruby

A Ruby project with [RSpec](https://github.com/rspec/rspec) and [Simplecov](https://github.com/simplecov-ruby/simplecov) requires some configuring to work with the vscode-vscode-coverage-gutters default configuration.

## Installation

Add the following to your Simplecov configuration located in the [spec_helper.rb](spec/spec_helper.rb) file.

```ruby
require 'simplecov'
require 'simplecov-lcov'

SimpleCov::Formatter::LcovFormatter.config do |c|
  c.report_with_single_file = true # vscode-coverage-gutters prefers a single file for lcov reporting
  c.output_directory = 'coverage' # vscode-coverage-gutters default directory path is 'coverage'
  c.lcov_file_name = 'lcov.info' # vscode-coverage-gutters default report filename is 'lcov.info'
end

SimpleCov.start do
  enable_coverage :branch
  formatter SimpleCov::Formatter::MultiFormatter.new([
                                                       SimpleCov::Formatter::LcovFormatter, # Add Lcov as an output when generating code coverage report
                                                       SimpleCov::Formatter::HTMLFormatter # Add other outputs for the code coverage report
                                                     ])
end
```

Ensure `spec_helper.rb` is included when running your test. This example uses `.rspec` to specify additional command line arguments.

```text
...
--require spec_helper
...
```

## Usage

Run the test suite to generate the code coverage report.

Install dependancies

```console
  $ bundle install

  Using rake 10.5.0
  Using app 0.1.0 from source at `.`
  Using bundler 1.17.3
  Using diff-lcs 1.4.4
  Using docile 1.3.5
  Using rspec-support 3.10.2
  Using rspec-core 3.10.1
  Using rspec-expectations 3.10.1
  Using rspec-mocks 3.10.2
  Using rspec 3.10.0
  Using simplecov-html 0.12.3
  Using simplecov_json_formatter 0.1.2
  Using simplecov 0.21.2
  Using simplecov-lcov 0.8.0
  Bundle complete! 6 Gemfile dependencies, 14 gems now installed.
  Use `bundle info [gemname]` to see where a bundled gem is installed.
```

Run the test suite:

```console
  $ bundle exec rspec

  App::Math
    #sum
      is expected to eq 0
      is expected to eq 1
      is expected to eq 3
      is expected to eq 6

  App
    #VERSION
      is expected not to be nil
    #Math
      is expected not to be nil

  Finished in 0.00228 seconds (files took 0.08635 seconds to load)
  6 examples, 0 failures

  Lcov style coverage report generated for RSpec to coverage/lcov.info
  Coverage report generated for RSpec to /home/david/vscode-coverage-gutters/example/ruby/coverage. 20 / 20 LOC (100.0%) covered.
```

Code coverage files are located in the `coverage` folder.

An example [lcov.info](lcov.info) is provided in the root directory for your reference.

I find this extension works well with [guard](https://github.com/guard/guard) and [guard-rspec](https://github.com/guard/guard-rspec) as it updates runs the tests when a file changes, which updates the gutters.
