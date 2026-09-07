module Api
  class ElementsController < ApplicationController
    def create
      element = Page.find(element_params.delete(:page_id)).elements.create!(element_params)
      render json: element, status: :created
    end

    def update
      element = Element.find(params[:id])
      element.update!(element_params.except(:page_id))
      render json: element
    end

    def destroy
      Element.find(params[:id]).destroy!
      head :no_content
    end

    private

    def element_params
      params.require(:element).permit(:page_id, :kind, :x, :y, :width, :height, :position, properties: {})
    end
  end
end
