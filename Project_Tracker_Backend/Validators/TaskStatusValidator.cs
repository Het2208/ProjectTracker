using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Validators
{
    public class TaskStatusCreateDTOValidator : AbstractValidator<TaskStatusCreateDTO>
    {
        private readonly AppDbContext _context;

        public TaskStatusCreateDTOValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.TaskStatusName)
                .NotEmpty()
                .WithMessage("Task status name is required.")
                .MaximumLength(20)
                .WithMessage("Task status name cannot exceed 20 characters.")
                .MustAsync(async (name, cancellation) =>
                {
                    return !await _context.TaskStatus.AnyAsync(ts => ts.TaskStatusName == name, cancellation);
                })
                .WithMessage("Task status name already exists.");

            RuleFor(x => x.TaskStatusCssClass)
                .NotEmpty()
                .WithMessage("Task status css class is required.")
                .MaximumLength(100)
                .WithMessage("Task status css class cannot exceed 100 characters.");
        }
    }

    public class TaskStatusUpdateDTOValidator : AbstractValidator<TaskStatusUpdateDTO>
    {
        public TaskStatusUpdateDTOValidator()
        {
            RuleFor(x => x.TaskStatusName)
                .NotEmpty()
                .WithMessage("Task status name is required.")
                .MaximumLength(20)
                .WithMessage("Task status name cannot exceed 20 characters.");

            RuleFor(x => x.TaskStatusCssClass)
                .NotEmpty()
                .WithMessage("Task status css class is required.")
                .MaximumLength(100)
                .WithMessage("Task status css class cannot exceed 100 characters.");
        }
    }
}