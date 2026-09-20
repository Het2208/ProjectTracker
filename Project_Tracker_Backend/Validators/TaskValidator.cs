using FluentValidation;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Validators
{
    public class TaskCreateDTOValidator : AbstractValidator<TaskCreateDTO>
    {
        public TaskCreateDTOValidator()
        {
            RuleFor(x => x.ProjectAllocationID)
                .GreaterThan(0)
                .WithMessage("ProjectAllocationID is required.");

            RuleFor(x => x.TaskTitle)
                .NotEmpty()
                .WithMessage("Task title is required.")
                .MaximumLength(200)
                .WithMessage("Task title cannot exceed 200 characters.");

            RuleFor(x => x.TaskStatusID)
                .GreaterThan(0)
                .WithMessage("TaskStatusID is required.");

            RuleFor(x => x.TaskPriorityID)
                .GreaterThan(0)
                .WithMessage("TaskPriorityID is required.");

            RuleFor(x => x.AssignedScore)
                .GreaterThanOrEqualTo(0)
                .WithMessage("AssignedScore must be 0 or greater.");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0m, 100m)
                .WithMessage("ProgressPercentage must be between 0 and 100.");

            RuleFor(x => x.TaskAssignedDate)
                .NotEmpty()
                .WithMessage("TaskAssignedDate is required.");

            RuleFor(x => x.FacultyRemarks)
                .MaximumLength(500)
                .WithMessage("Faculty remarks cannot exceed 500 characters.");

            RuleFor(x => x.StudentRemarks)
                .MaximumLength(500)
                .WithMessage("Student remarks cannot exceed 500 characters.");
        }
    }

    public class TaskUpdateDTOValidator : AbstractValidator<TaskUpdateDTO>
    {
        public TaskUpdateDTOValidator()
        {
            RuleFor(x => x.ProjectAllocationID)
                .GreaterThan(0)
                .WithMessage("ProjectAllocationID is required.");

            RuleFor(x => x.TaskTitle)
                .NotEmpty()
                .WithMessage("Task title is required.")
                .MaximumLength(200)
                .WithMessage("Task title cannot exceed 200 characters.");

            RuleFor(x => x.TaskStatusID)
                .GreaterThan(0)
                .WithMessage("TaskStatusID is required.");

            RuleFor(x => x.TaskPriorityID)
                .GreaterThan(0)
                .WithMessage("TaskPriorityID is required.");

            RuleFor(x => x.AssignedScore)
                .GreaterThanOrEqualTo(0)
                .WithMessage("AssignedScore must be 0 or greater.");

            RuleFor(x => x.ProgressPercentage)
                .InclusiveBetween(0m, 100m)
                .WithMessage("ProgressPercentage must be between 0 and 100.");

            RuleFor(x => x.FacultyRemarks)
                .MaximumLength(500)
                .WithMessage("Faculty remarks cannot exceed 500 characters.");

            RuleFor(x => x.StudentRemarks)
                .MaximumLength(500)
                .WithMessage("Student remarks cannot exceed 500 characters.");
        }
    }
}