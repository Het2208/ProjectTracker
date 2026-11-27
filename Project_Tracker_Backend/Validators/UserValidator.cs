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
                    var normalized = (email ?? string.Empty).Trim().ToLower();
                    return !await _context.Users.AnyAsync(u => u.Email.ToLower() == normalized, cancellation);
                })
                .WithMessage("Email already exists.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Password is required.")
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters.")
                .MaximumLength(255)
                .WithMessage("Password cannot exceed 255 characters.");

            RuleFor(x => x.MobileNumber)
                .NotEmpty()
                .WithMessage("Mobile number is required.")
                .MaximumLength(15)
                .WithMessage("Mobile number cannot exceed 15 characters.");

            RuleFor(x => x.ProfilePicturePath)
                .Must(file => file == null || file.Length > 0)
                .WithMessage("Profile picture file cannot be empty.");
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

    public class UserRegisterDTOValidator : AbstractValidator<UserRegisterDTO>
    {
        private readonly AppDbContext _context;

        public UserRegisterDTOValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.Role)
                .NotEmpty()
                .WithMessage("Role is required.")
                .Must(r => string.Equals(r, "Student", StringComparison.OrdinalIgnoreCase) ||
                           string.Equals(r, "Faculty", StringComparison.OrdinalIgnoreCase))
                .WithMessage("Registration is only permitted for Student or Faculty roles.");

            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Full name is required.")
                .MaximumLength(150)
                .WithMessage("Full name cannot exceed 150 characters.");

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .MaximumLength(150)
                .WithMessage("Email cannot exceed 150 characters.")
                .EmailAddress()
                .WithMessage("Invalid email format.")
                .MustAsync(async (email, cancellation) =>
                {
                    var normalized = (email ?? string.Empty).Trim().ToLower();
                    return !await _context.Users.AnyAsync(u => u.Email.ToLower() == normalized, cancellation);
                })
                .WithMessage("An account with this email already exists.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Password is required.")
                .MinimumLength(8)
                .WithMessage("Password must be at least 8 characters.")
                .MaximumLength(255)
                .WithMessage("Password cannot exceed 255 characters.");

            RuleFor(x => x.MobileNumber)
                .NotEmpty()
                .WithMessage("Mobile number is required.")
                .Matches(@"^\d{10}$")
                .WithMessage("Mobile number must be exactly 10 digits.");

            RuleFor(x => x.ProfilePicture)
                .Must(file => file == null || file.Length > 0)
                .WithMessage("Profile picture cannot be an empty file.");

            // Student validation
            When(x => string.Equals(x.Role, "Student", StringComparison.OrdinalIgnoreCase), () =>
            {
                RuleFor(x => x.EnrollmentNumber)
                    .NotEmpty()
                    .WithMessage("Enrollment number is required.")
                    .MaximumLength(100);
                RuleFor(x => x.Department).NotEmpty().WithMessage("Department is required.");
                RuleFor(x => x.Semester).NotEmpty().WithMessage("Semester is required.");
                RuleFor(x => x.Division).NotEmpty().WithMessage("Division is required.");
                RuleFor(x => x.Batch).NotEmpty().WithMessage("Batch is required.");
            });

            // Faculty validation
            When(x => string.Equals(x.Role, "Faculty", StringComparison.OrdinalIgnoreCase), () =>
            {
                RuleFor(x => x.FacultyId)
                    .NotEmpty()
                    .WithMessage("Faculty ID is required.")
                    .MaximumLength(100);
                RuleFor(x => x.Department).NotEmpty().WithMessage("Department is required.");
                RuleFor(x => x.Designation).NotEmpty().WithMessage("Designation is required.");
                RuleFor(x => x.AreaOfExpertise).NotEmpty().WithMessage("Area of expertise is required.");
            });
        }
    }
}
