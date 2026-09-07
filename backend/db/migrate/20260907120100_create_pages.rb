class CreatePages < ActiveRecord::Migration[8.1]
  def change
    create_table :pages do |t|
      t.references :project, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :width, null: false, default: 1440
      t.integer :height, null: false, default: 900

      t.timestamps
    end
  end
end
