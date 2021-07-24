# frozen_string_literal: true

module App
  # Math library for lists of strings
  class Math
    def self.sum(list = [''])
      return 0 if list.empty?

      list.map(&:to_i).sum
    end
  end
end
