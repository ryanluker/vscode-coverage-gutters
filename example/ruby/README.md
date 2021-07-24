# Ruby

A ruby project requires some configuring to work with the vscode-vscode-coverage-gutters default configuration.

_Note: Cloning this example and running the test will not generate the code coverage reports. Please copy the parts you need into your project._

## Installation

Add the following to your Simplecov configuration located in the [spec_helper.rb](spec/spec_helper.rb) file.

```ruby
require 'simplecov'
require 'simplecov-lcov'

SimpleCov::Formatter::LcovFormatter.config do |c|
  c.report_with_single_file = true # vscode-coverage-gutters preffers a single file for lcov reporting
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

## Usage

That's it! I find this extention works well with [guard](https://github.com/guard/guard) and [guard-rspec](https://github.com/guard/guard-rspec) as it updates the gutters in real time when the test suite is executed.
