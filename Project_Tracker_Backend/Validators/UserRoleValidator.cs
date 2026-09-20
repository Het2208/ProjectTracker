using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Validators
{
    public class UserRoleCreateDTOValidator : AbstractValidator<UserRoleCreateDTO>
    {
        private readonly AppDbContext _context;

        public UserRoleCreateDTOValidator(AppDbContext context)
        {
            _context = context;

            RuleFor(x => x.RoleId)
                .GreaterThan(0)
                .WithMessage("RoleId is required.");

            RuleFor(x => x.UserId)
                .GreaterThan(0)
                .WithMessage("UserId is required.");

            RuleFor(x => x)
                .MustAsync(async (dto, cancellation) =>
                {
                    return !await _context.UserRole.AnyAsync(ur => ur.RoleId == dto.RoleId && ur.UserId == dto.UserId, cancellation);
                })
                .WithMessage("This user role link already exists.");
        }
    }

    public class UserRoleUpdateDTOValidator : AbstractValidator<UserRoleUpdateDTO>
    {
        public UserRoleUpdateDTOValidator()
        {
            RuleFor(x => x.RoleId)
                .GreaterThan(0)
                .WithMessage("RoleId is required.");

            RuleFor(x => x.UserId)
                .GreaterThan(0)
                .WithMessage("UserId is required.");
        }
    }
}