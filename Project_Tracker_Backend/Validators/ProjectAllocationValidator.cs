using FluentValidation;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Validators
{
    public class ProjectAllocationCreateDTOValidator : AbstractValidator<ProjectAllocationCreateDTO>
    {
        public ProjectAllocationCreateDTOValidator()
        {
            RuleFor(x => x.ProjectID)
                .GreaterThan(0)
                .WithMessage("ProjectID is required.");

            RuleFor(x => x.StudentID)
                .GreaterThan(0)
                .WithMessage("StudentID is required.");

            RuleFor(x => x.FacultyID)
                .GreaterThan(0)
                .WithMessage("FacultyID is required.");

            RuleFor(x => x.ProjectStartDate)
                .NotEmpty()
                .WithMessage("ProjectStartDate is required.");

            RuleFor(x => x.ProjectEndDate)
                .NotEmpty()
                .WithMessage("ProjectEndDate is required.")
                .GreaterThan(x => x.ProjectStartDate)
                .WithMessage("ProjectEndDate must be after ProjectStartDate.");

            RuleFor(x => x.TotalTasksGiven)
                .GreaterThanOrEqualTo(0)
                .WithMessage("TotalTasksGiven must be 0 or greater.");

            RuleFor(x => x.TotalCompletedTasks)
                .GreaterThanOrEqualTo(0)
                .WithMessage("TotalCompletedTasks must be 0 or greater.");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0m, 100m)
                .WithMessage("ProgressPercentage must be between 0 and 100.");

            RuleFor(x => x.OverAllGrade)
                .MaximumLength(1)
                .WithMessage("OverAllGrade cannot exceed 1 character.")
                .Matches("^[ABC]?$")
                .WithMessage("Grade must be A, B, or C.");
        }
    }

    public class ProjectAllocationUpdateDTOValidator : AbstractValidator<ProjectAllocationUpdateDTO>
    {
        public ProjectAllocationUpdateDTOValidator()
        {
            RuleFor(x => x.ProjectID)
                .GreaterThan(0)
                .WithMessage("ProjectID is required.");

            RuleFor(x => x.StudentID)
                .GreaterThan(0)
                .WithMessage("StudentID is required.");

            RuleFor(x => x.FacultyID)
                .GreaterThan(0)
                .WithMessage("FacultyID is required.");

            RuleFor(x => x.ProjectStartDate)
                .NotEmpty()
                .WithMessage("ProjectStartDate is required.");

            RuleFor(x => x.ProjectEndDate)
                .NotEmpty()
                .WithMessage("ProjectEndDate is required.")
                .GreaterThan(x => x.ProjectStartDate)
                .WithMessage("ProjectEndDate must be after ProjectStartDate.");

            RuleFor(x => x.TotalTasksGiven)
                .GreaterThanOrEqualTo(0)
                .WithMessage("TotalTasksGiven must be 0 or greater.");

            RuleFor(x => x.TotalCompletedTasks)
                .GreaterThanOrEqualTo(0)
                .WithMessage("TotalCompletedTasks must be 0 or greater.");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0m, 100m)
                .WithMessage("ProgressPercentage must be between 0 and 100.");

            RuleFor(x => x.OverAllGrade)
                .MaximumLength(1)
                .WithMessage("OverAllGrade cannot exceed 1 character.")
                .Matches("^[ABC]?$")
                .WithMessage("Grade must be A, B, or C.");
        }
    }
}