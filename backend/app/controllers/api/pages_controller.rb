module Api
  class PagesController < ApplicationController
    def show
      render json: Page.includes(:elements).find(params[:id]).as_json(include: :elements)
    end

    def create
      page = Project.find(params[:project_id]).pages.create!(page_params)
      render json: page, status: :created
    end

    private

    def page_params
      params.require(:page).permit(:name, :width, :height)
    end
  end
end
