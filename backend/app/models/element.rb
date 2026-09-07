class Element < ApplicationRecord
  KINDS = %w[text rectangle ellipse image].freeze

  belongs_to :page

  validates :kind, inclusion: { in: KINDS }
  validates :width, :height, numericality: { greater_than: 0 }
  validates :x, :y, :position, numericality: { only_integer: true }
end
