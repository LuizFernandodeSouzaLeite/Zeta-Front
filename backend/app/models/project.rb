class Project < ApplicationRecord
  has_many :pages, dependent: :destroy

  validates :name, presence: true
end
