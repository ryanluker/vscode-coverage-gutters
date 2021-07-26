# frozen_string_literal: true

require 'app/math'

RSpec.describe App::Math do
  describe '#sum' do
    it { expect(described_class.sum(['1'])).to eq 1 }
    it { expect(described_class.sum(%w[1 2])).to eq 3 }
    it { expect(described_class.sum(%w[1 2 3])).to eq 6 }
  end
end
