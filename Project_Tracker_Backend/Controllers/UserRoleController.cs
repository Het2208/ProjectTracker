using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Comman;

namespace Project_Tracker_Backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserRoleController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<UserRoleCreateDTO> _createValidator;
        private readonly IValidator<UserRoleUpdateDTO> _updateValidator;

        public UserRoleController(
            AppDbContext context,
            IValidator<UserRoleCreateDTO> createValidator,
            IValidator<UserRoleUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userRoles = await _context.UserRole
                .Include(ur => ur.Role)
                .Include(ur => ur.User)
                .Select(ur => new UserRoleReadDTO
                {
                    RolePermissionId = ur.RolePermissionId,
                    RoleId = ur.RoleId,
                    RoleName = ur.Role != null ? ur.Role.RoleName : null,
                    UserId = ur.UserId,
                    FullName = ur.User != null ? ur.User.FullName : null
                }).ToListAsync();

            return Ok(new APIResponse<List<UserRoleReadDTO>>
            {
                Success = true,
                Message = "Get all user roles successfully",
                Data = userRoles
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userRole = await _context.UserRole
                .Include(ur => ur.Role)
                .Include(ur => ur.User)
                .Where(ur => ur.RolePermissionId == id)
                .Select(ur => new UserRoleReadDTO
                {
                    RolePermissionId = ur.RolePermissionId,
                    RoleId = ur.RoleId,
                    RoleName = ur.Role != null ? ur.Role.RoleName : null,
                    UserId = ur.UserId,
                    FullName = ur.User != null ? ur.User.FullName : null
                })
                .FirstOrDefaultAsync();

            if (userRole == null)
            {
                return NotFound(new APIResponse<UserRoleReadDTO>
                {
                    Success = false,
                    Message = "User role not found"
                });
            }

            return Ok(new APIResponse<UserRoleReadDTO>
            {
                Success = true,
                Message = "User role retrieved successfully",
                Data = userRole
            });
        }

        [HttpPost]
        public async Task<IActionResult> Add(UserRoleCreateDTO dto)
        {
            var validationResult = await _createValidator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = validationResult.Errors
                        .Select(e => e.ErrorMessage)
                        .ToList()
                });
            }

            try
            {
                var userRole = new UserRole
                {
                    RoleId = dto.RoleId,
                    UserId = dto.UserId
                };

                _context.UserRole.Add(userRole);
                await _context.SaveChangesAsync();

                var role = await _context.Role.FindAsync(userRole.RoleId);
                var user = await _context.Users.FindAsync(userRole.UserId);

                var result = new UserRoleReadDTO
                {
                    RolePermissionId = userRole.RolePermissionId,
                    RoleId = userRole.RoleId,
                    RoleName = role?.RoleName,
                    UserId = userRole.UserId,
                    FullName = user?.FullName
                };

                return Ok(new APIResponse<UserRoleReadDTO>
                {
                    Success = true,
                    Message = "User Role Link Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<UserRoleReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding user role link",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UserRoleUpdateDTO dto)
        {
            var validationResult = await _updateValidator.ValidateAsync(dto);

            if (!validationResult.IsValid)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = validationResult.Errors
                        .Select(e => e.ErrorMessage)
                        .ToList()
                });
            }

            try
            {
                var existingUserRole = await _context.UserRole.FindAsync(id);

                if (existingUserRole == null)
                {
                    return NotFound(new APIResponse<UserRoleReadDTO>
                    {
                        Success = false,
                        Message = "User role not found"
                    });
                }

                existingUserRole.RoleId = dto.RoleId;
                existingUserRole.UserId = dto.UserId;

                await _context.SaveChangesAsync();

                var role = await _context.Role.FindAsync(existingUserRole.RoleId);
                var user = await _context.Users.FindAsync(existingUserRole.UserId);

                var result = new UserRoleReadDTO
                {
                    RolePermissionId = existingUserRole.RolePermissionId,
                    RoleId = existingUserRole.RoleId,
                    RoleName = role?.RoleName,
                    UserId = existingUserRole.UserId,
                    FullName = user?.FullName
                };

                return Ok(new APIResponse<UserRoleReadDTO>
                {
                    Success = true,
                    Message = "User Role Link Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<UserRoleReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating user role link",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userRole = await _context.UserRole.FindAsync(id);
                if (userRole == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "User role not found"
                    });
                }

                _context.UserRole.Remove(userRole);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "User Role link deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting user role link",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}