using FluentValidation;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;

namespace Project_Tracker_Backend.Validators
{
    public class UserTypeCreateValidator : AbstractValidator<UserTypeCreateDTO>
    {
        public UserTypeCreateValidator() { 

            RuleFor(x => x.UserTypeName)
                .NotEmpty().WithMessage("User type name is required.")
                .MaximumLength(50).WithMessage("User type name cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(250).WithMessage("Description cannot exceed 250 characters.");
        }
    }

    public class UserTypeUpdateValidator : AbstractValidator<UserTypeUpdateDTO>
    {
        public UserTypeUpdateValidator()
        {

            RuleFor(x => x.UserTypeName)
                .NotEmpty().WithMessage("User type name is required.")
                .MaximumLength(50).WithMessage("User type name cannot exceed 50 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(250).WithMessage("Description cannot exceed 250 characters.");
        }
    }
}
