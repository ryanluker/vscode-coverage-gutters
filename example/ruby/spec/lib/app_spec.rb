# frozen_string_literal: true

RSpec.describe App do
  describe '#VERSION' do
    it { expect(described_class::VERSION).not_to be_nil }
  end

  describe '#Math' do
    it { expect(described_class::Math).not_to be_nil }
  end
end
