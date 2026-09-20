using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Validators
{
    public class TaskPriorityCreateDTOValidator : AbstractValidator<TaskPriorityCreateDTO>
    {
        private readonly AppDbContext _context;

        public TaskPriorityCreateDTOValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.TaskPriorityName)
                .NotEmpty()
                .WithMessage("Task priority name is required.")
                .MaximumLength(20)
                .WithMessage("Task priority name cannot exceed 20 characters.")
                .MustAsync(async (name, cancellation) =>
                {
                    return !await _context.TaskPriority.AnyAsync(tp => tp.TaskPriorityName == name, cancellation);
                })
                .WithMessage("Task priority name already exists.");

            RuleFor(x => x.TaskPriorityCssClass)
                .NotEmpty()
                .WithMessage("Task priority css class is required.")
                .MaximumLength(20)
                .WithMessage("Task priority css class cannot exceed 20 characters.");
        }
    }

    public class TaskPriorityUpdateDTOValidator : AbstractValidator<TaskPriorityUpdateDTO>
    {
        public TaskPriorityUpdateDTOValidator()
        {
            RuleFor(x => x.TaskPriorityName)
                .NotEmpty()
                .WithMessage("Task priority name is required.")
                .MaximumLength(20)
                .WithMessage("Task priority name cannot exceed 20 characters.");

            RuleFor(x => x.TaskPriorityCssClass)
                .NotEmpty()
                .WithMessage("Task priority css class is required.")
                .MaximumLength(20)
                .WithMessage("Task priority css class cannot exceed 20 characters.");
        }
    }
}