module Api
  class ProjectsController < ApplicationController
    def create
      project = Project.new(project_params)
      project.pages.build(name: "Page 1")
      project.save!

      render json: project_payload(project), status: :created
    end

    def show
      render json: project_payload(Project.includes(pages: :elements).find(params[:id]))
    end

    private

    def project_params
      params.require(:project).permit(:name)
    end

    def project_payload(project)
      project.as_json(include: { pages: { include: :elements } })
    end
  end
end
