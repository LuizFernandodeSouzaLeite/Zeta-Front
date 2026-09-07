class CreateElements < ActiveRecord::Migration[8.1]
  def change
    create_table :elements do |t|
      t.references :page, null: false, foreign_key: true
      t.string :kind, null: false
      t.integer :x, null: false, default: 0
      t.integer :y, null: false, default: 0
      t.integer :width, null: false, default: 100
      t.integer :height, null: false, default: 100
      t.integer :position, null: false, default: 0
      t.jsonb :properties, null: false, default: {}

      t.timestamps
    end
  end
end
