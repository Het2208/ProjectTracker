using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Comman;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;

namespace Project_Tracker_Backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<RoleCreateDTO> _createValidator;
        private readonly IValidator<RoleUpdateDTO> _updateValidator;

        public RoleController(
            AppDbContext context,
            IValidator<RoleCreateDTO> createValidator,
            IValidator<RoleUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _context.Role
                .Select(r => new RoleReadDTO
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description
                })
                .ToListAsync();

            return Ok(new APIResponse<List<RoleReadDTO>>
            {
                Success = true,
                Message = "Get all roles successfully",
                Data = roles
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var role = await _context.Role
                .Where(r => r.RoleId == id)
                .Select(r => new RoleReadDTO
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description
                })
                .FirstOrDefaultAsync();

            if (role == null)
            {
                return NotFound(new APIResponse<RoleReadDTO>
                {
                    Success = false,
                    Message = "Role not found"
                });
            }

            return Ok(new APIResponse<RoleReadDTO>
            {
                Success = true,
                Message = "Role retrieved successfully",
                Data = role
            });
        }

        [HttpPost]
        public async Task<IActionResult> Add(RoleCreateDTO dto)
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
                var role = new Role
                {
                    RoleName = dto.RoleName,
                    Description = dto.Description
                };

                _context.Role.Add(role);

                await _context.SaveChangesAsync();

                var result = new RoleReadDTO
                {
                    RoleId = role.RoleId,
                    RoleName = role.RoleName,
                    Description = role.Description
                };

                return Ok(new APIResponse<RoleReadDTO>
                {
                    Success = true,
                    Message = "Role Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<RoleReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding role",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, RoleUpdateDTO dto)
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
                var existingRole = await _context.Role.FindAsync(id);

                if (existingRole == null)
                {
                    return NotFound(new APIResponse<RoleReadDTO>
                    {
                        Success = false,
                        Message = "Role not found"
                    });
                }

                existingRole.RoleName = dto.RoleName;
                existingRole.Description = dto.Description;

                await _context.SaveChangesAsync();

                var result = new RoleReadDTO
                {
                    RoleId = existingRole.RoleId,
                    RoleName = existingRole.RoleName,
                    Description = existingRole.Description
                };

                return Ok(new APIResponse<RoleReadDTO>
                {
                    Success = true,
                    Message = "Role Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<RoleReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating role",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var role = await _context.Role.FindAsync(id);

                if (role == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "Role not found"
                    });
                }

                _context.Role.Remove(role);

                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "Role deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting role",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}