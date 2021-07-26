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
  end
end
