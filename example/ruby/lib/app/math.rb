# frozen_string_literal: true

module App
  # Math library for lists of strings
  class Math
    def self.sum(list = [''])
      if list.empty?
        0
      else
        list.map(&:to_i).sum
      end
    end

    # Demonstrates partial branch coverage
    # Tests only even numbers, odd path remains uncovered
    def self.double_if_even(value)
      if value.even?
        value * 2  # Tested
      else
        value + 1  # May be untested
      end
    end

    # Complex conditional with multiple branches
    # Only some branches are exercised by tests
    def self.classify_number(num)
      return 'zero' if num.zero?  # Tested
      return 'negative' if num.negative?  # May be untested
      return 'large' if num > 100  # May be untested
      'positive'  # Partially tested
    end

    # Multi-condition logic for branch coverage demonstration
    def self.validate_and_transform(input, uppercase: false, trim: true)
      return nil if input.nil? || input.empty?  # One condition tested
      
      result = input.dup
      result = result.strip if trim  # May be partially tested
      result = result.upcase if uppercase  # May be partially tested
      result
    end
  end
end
