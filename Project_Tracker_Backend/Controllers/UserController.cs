using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Comman;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Services;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [Authorize(Roles = "Admin")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;
        private readonly IFileService _fileService;

        public UserController(AppDbContext context, TokenService tokenService, IFileService fileService)
        {
            _context = context;
            _tokenService = tokenService;
            _fileService = fileService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO dto)
        {
            try
            {
                var user = await _context.Users.Include(u => u.UserType)
                                               .SingleOrDefaultAsync(u =>
                                               u.Email == dto.Email &&
                                               u.Password == dto.Password);
                if (user == null)
                {
                    return Unauthorized("Invalid Email or password");
                }
                var token = _tokenService.GenerateToken(user);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Something went wrong: " + ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _context.Users
                .Include(u => u.UserType)
                .Select(u => new UserReadDTO
                {
                    UserId = u.UserId,
                    UserTypeId = u.UserTypeId,
                    UserTypeName = u.UserType != null ? u.UserType.UserTypeName : null,
                    FullName = u.FullName,
                    UserCode = u.UserCode,
                    Email = u.Email,
                    MobileNumber = u.MobileNumber,
                    ProfilePicturePath = u.ProfilePicturePath,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted
                }).ToListAsync();

            return Ok(new APIResponse<List<UserReadDTO>>
            {
                Success = true,
                Message = "Get all users successfully",
                Data = users
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _context.Users
                .Include(u => u.UserType)
                .Where(u => u.UserId == id)
                .Select(u => new UserReadDTO
                {
                    UserId = u.UserId,
                    UserTypeId = u.UserTypeId,
                    UserTypeName = u.UserType != null ? u.UserType.UserTypeName : null,
                    FullName = u.FullName,
                    UserCode = u.UserCode,
                    Email = u.Email,
                    MobileNumber = u.MobileNumber,
                    ProfilePicturePath = u.ProfilePicturePath,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new APIResponse<UserReadDTO>
                {
                    Success = false,
                    Message = "User not found"
                });
            }

            return Ok(new APIResponse<UserReadDTO>
            {
                Success = true,
                Message = "User retrieved successfully",
                Data = user
            });
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Add([FromForm] UserCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? uploadedPath = null;
            if (dto.ProfilePicturePath != null)
            {
                uploadedPath = await _fileService.UploadFileAsync(dto.ProfilePicturePath, "Users");
            }

            try
            {
                var user = new User
                {
                    UserTypeId = dto.UserTypeId,
                    FullName = dto.FullName,
                    UserCode = dto.UserCode,
                    Email = dto.Email,
                    Password = dto.Password,
                    MobileNumber = dto.MobileNumber,
                    ProfilePicturePath = uploadedPath ?? string.Empty,
                    IsActive = dto.IsActive,
                    IsDeleted = false
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var userType = await _context.UserType.FindAsync(user.UserTypeId);

                var result = new UserReadDTO
                {
                    UserId = user.UserId,
                    UserTypeId = user.UserTypeId,
                    UserTypeName = userType?.UserTypeName,
                    FullName = user.FullName,
                    UserCode = user.UserCode,
                    Email = user.Email,
                    MobileNumber = user.MobileNumber,
                    ProfilePicturePath = user.ProfilePicturePath,
                    IsActive = user.IsActive,
                    IsDeleted = user.IsDeleted
                };

                return Ok(new APIResponse<UserReadDTO>
                {
                    Success = true,
                    Message = "User Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<UserReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("{id:int}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] UserUpdateDTO dto)
        {
            if (id != dto.UserId)
                return BadRequest("ID mismatch.");

            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
                return NotFound("User not found.");

            try
            {
                if (dto.ProfilePicturePath != null && dto.ProfilePicturePath.Length > 0)
                {
                    _fileService.DeleteFile(existingUser.ProfilePicturePath);
                    existingUser.ProfilePicturePath = await _fileService.UploadFileAsync(dto.ProfilePicturePath, "Users");
                }

                existingUser.UserTypeId = dto.UserTypeId;
                existingUser.FullName = dto.FullName;
                existingUser.UserCode = dto.UserCode;
                existingUser.Email = dto.Email;
                if (!string.IsNullOrWhiteSpace(dto.Password))
                {
                    existingUser.Password = dto.Password;
                }
                existingUser.MobileNumber = dto.MobileNumber;
                existingUser.IsActive = dto.IsActive;
                existingUser.IsDeleted = dto.IsDeleted;

                _context.Users.Update(existingUser);
                await _context.SaveChangesAsync();

                var userType = await _context.UserType.FindAsync(existingUser.UserTypeId);

                var result = new UserReadDTO
                {
                    UserId = existingUser.UserId,
                    UserTypeId = existingUser.UserTypeId,
                    UserTypeName = userType?.UserTypeName,
                    FullName = existingUser.FullName,
                    UserCode = existingUser.UserCode,
                    Email = existingUser.Email,
                    MobileNumber = existingUser.MobileNumber,
                    ProfilePicturePath = existingUser.ProfilePicturePath,
                    IsActive = existingUser.IsActive,
                    IsDeleted = existingUser.IsDeleted
                };

                return Ok(new APIResponse<UserReadDTO>
                {
                    Success = true,
                    Message = "User Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<UserReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] bool deleteFileOnly = false)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                if (deleteFileOnly)
                {
                    if (string.IsNullOrEmpty(user.ProfilePicturePath))
                    {
                        return BadRequest(new APIResponse<object>
                        {
                            Success = false,
                            Message = "No document exists for this user."
                        });
                    }

                    _fileService.DeleteFile(user.ProfilePicturePath);
                    user.ProfilePicturePath = string.Empty;
                    await _context.SaveChangesAsync();

                    return Ok(new APIResponse<object>
                    {
                        Success = true,
                        Message = "Document deleted successfully."
                    });
                }

                _fileService.DeleteFile(user.ProfilePicturePath);
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "User deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}
