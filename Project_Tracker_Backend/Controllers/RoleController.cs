using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Project_Tracker_Backend.Comman;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Services;

namespace Project_Tracker_Backend.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IValidator<RoleCreateDTO> _createValidator;
        private readonly IValidator<RoleUpdateDTO> _updateValidator;

        public RoleController(
            IRoleService roleService,
            IValidator<RoleCreateDTO> createValidator,
            IValidator<RoleUpdateDTO> updateValidator)
        {
            _roleService = roleService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _roleService.GetAllAsync();

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
            var role = await _roleService.GetByIdAsync(id);

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
                var result = await _roleService.AddAsync(dto);

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
                var result = await _roleService.UpdateAsync(id, dto);

                if (result == null)
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
                var deleted = await _roleService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "Role not found"
                    });
                }

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
