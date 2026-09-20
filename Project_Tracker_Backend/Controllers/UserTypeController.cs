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
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserTypeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<UserTypeCreateDTO> _createValidator;
        private readonly IValidator<UserTypeUpdateDTO> _updateValidator;
        public UserTypeController(
            AppDbContext context,
            IValidator<UserTypeCreateDTO> createValidator,
            IValidator<UserTypeUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userTypes = await _context.UserType
                .Select(ut => new UserTypeReadDTO
                {
                    UserTypeID = ut.UserTypeId,
                    UserTypeName = ut.UserTypeName,
                    Description = ut.Description
                }).ToListAsync();

            return Ok(new APIResponse<List<UserTypeReadDTO>>
            {
                Success = true,
                Message = "Get all user types successfully",
                Data = userTypes
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userType = await _context.UserType
                .Where(ut => ut.UserTypeId == id)
                .Select(ut => new UserTypeReadDTO
                {
                    UserTypeID = ut.UserTypeId,
                    UserTypeName = ut.UserTypeName,
                    Description = ut.Description
                })
                .FirstOrDefaultAsync();

            if (userType == null)
            {
                return NotFound(new APIResponse<UserTypeReadDTO>
                {
                    Success = false,
                    Message = "User type not found"
                });
            }

            return Ok(new APIResponse<UserTypeReadDTO>
            {
                Success = true,
                Message = "User type retrieved successfully",
                Data = userType
            });
        }

        [HttpPost]
        public async Task<IActionResult> Add(UserTypeCreateDTO dto)
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
                var newUserType = new UserType  
                {
                    UserTypeName = dto.UserTypeName,
                    Description = dto.Description
                };

                _context.UserType.Add(newUserType);
                await _context.SaveChangesAsync();

                var result = new UserTypeReadDTO
                {
                    UserTypeID = newUserType.UserTypeId,
                    UserTypeName = newUserType.UserTypeName,
                    Description = newUserType.Description
                };

                return Ok(new APIResponse<UserTypeReadDTO>
                {
                    Success = true,
                    Message = "User Type Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<UserTypeReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding user type",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UserTypeUpdateDTO dto)
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
                var existingUserType = await _context.UserType.FindAsync(id);

                if (existingUserType == null)
                {
                    return NotFound(new APIResponse<UserTypeReadDTO>
                    {
                        Success = false,
                        Message = "User type not found"
                    });
                }

                existingUserType.UserTypeName = dto.UserTypeName;
                existingUserType.Description = dto.Description;

                await _context.SaveChangesAsync();

                var result = new UserTypeReadDTO
                {
                    UserTypeID = existingUserType.UserTypeId,
                    UserTypeName = existingUserType.UserTypeName,
                    Description = existingUserType.Description
                };

                return Ok(new APIResponse<UserTypeReadDTO>
                {
                    Success = true,
                    Message = "User Type Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<UserTypeReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating user type",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userType = await _context.UserType.FindAsync(id);

                if (userType == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "User type not found"
                    });
                }

                _context.UserType.Remove(userType);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "User Type deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting user type",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}