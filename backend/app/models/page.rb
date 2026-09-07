class Page < ApplicationRecord
  belongs_to :project
  has_many :elements, dependent: :destroy

  validates :name, presence: true
  validates :width, :height, numericality: { greater_than: 0 }
end
