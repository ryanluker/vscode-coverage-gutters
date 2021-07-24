# frozen_string_literal: true

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

require 'bundler/setup'
require 'app'

RSpec.configure do |config|
  # Enable flags like --only-failures and --next-failure
  config.example_status_persistence_file_path = '.rspec_status'

  # Disable RSpec exposing methods globally on `Module` and `main`
  config.disable_monkey_patching!

  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
end
