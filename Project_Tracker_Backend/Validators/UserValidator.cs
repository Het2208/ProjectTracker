using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Validators
{
    public class UserCreateDTOValidator : AbstractValidator<UserCreateDTO>
    {
        private readonly AppDbContext _context;

        public UserCreateDTOValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.UserTypeId)
                .GreaterThan(0)
                .WithMessage("UserTypeId is required.");

            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Full name is required.")
                .MaximumLength(150)
                .WithMessage("Full name cannot exceed 150 characters.");

            RuleFor(x => x.UserCode)
                .MaximumLength(100)
                .WithMessage("User code cannot exceed 100 characters.");

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .MaximumLength(150)
                .WithMessage("Email cannot exceed 150 characters.")
                .EmailAddress()
                .WithMessage("Invalid email format.")
                .MustAsync(async (email, cancellation) =>
                {
                    return !await _context.Users.AnyAsync(u => u.Email == email, cancellation);
                })
                .WithMessage("Email already exists.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Password is required.")
                .MaximumLength(255)
                .WithMessage("Password cannot exceed 255 characters.");

            RuleFor(x => x.MobileNumber)
                .NotEmpty()
                .WithMessage("Mobile number is required.")
                .MaximumLength(15)
                .WithMessage("Mobile number cannot exceed 15 characters.");

            RuleFor(x => x.ProfilePicturePath)
                .NotNull()
                .WithMessage("Profile picture is required.")
                .Must(file => file != null && file.Length > 0)
                .WithMessage("Profile picture is required.");

            // IsActive is required by model; it's a bool so no further check here.
        }
    }

    public class UserUpdateDTOValidator : AbstractValidator<UserUpdateDTO>
    {
        public UserUpdateDTOValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0)
                .WithMessage("UserId is required.");

            RuleFor(x => x.UserTypeId)
                .GreaterThan(0)
                .WithMessage("UserTypeId is required.");

            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Full name is required.")
                .MaximumLength(150)
                .WithMessage("Full name cannot exceed 150 characters.");

            RuleFor(x => x.UserCode)
                .MaximumLength(100)
                .WithMessage("User code cannot exceed 100 characters.");

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .MaximumLength(150)
                .WithMessage("Email cannot exceed 150 characters.")
                .EmailAddress()
                .WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .MaximumLength(255)
                .WithMessage("Password cannot exceed 255 characters.");

            RuleFor(x => x.MobileNumber)
                .NotEmpty()
                .WithMessage("Mobile number is required.")
                .MaximumLength(15)
                .WithMessage("Mobile number cannot exceed 15 characters.");

            RuleFor(x => x.ProfilePicturePath)
                .Must(file => file == null || file.Length > 0)
                .WithMessage("Profile picture file is empty.");
        }
    }
}