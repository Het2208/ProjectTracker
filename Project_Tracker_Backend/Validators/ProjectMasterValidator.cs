using FluentValidation;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Validators
{
    public class ProjectMasterCreateDTOValidator : AbstractValidator<ProjectMasterCreateDTO>
    {
        public ProjectMasterCreateDTOValidator()
        {
            RuleFor(x => x.ProjectTitle)
                .NotEmpty()
                .WithMessage("Project title is required.")
                .MaximumLength(200)
                .WithMessage("Project title cannot exceed 200 characters.");

            // Description has no explicit max in model, so no max enforced here.
        }
    }

    public class ProjectMasterUpdateDTOValidator : AbstractValidator<ProjectMasterUpdateDTO>
    {
        public ProjectMasterUpdateDTOValidator()
        {
            RuleFor(x => x.ProjectTitle)
                .NotEmpty()
                .WithMessage("Project title is required.")
                .MaximumLength(200)
                .WithMessage("Project title cannot exceed 200 characters.");
        }
    }
}