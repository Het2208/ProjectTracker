using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Comman;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Services;
using System.Security.Claims;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;
        private readonly IFileService _fileService;
        private readonly IPasswordService _passwordService;
        private readonly IValidator<UserCreateDTO> _createValidator;
        private readonly IValidator<UserUpdateDTO> _updateValidator;
        private readonly IValidator<UserRegisterDTO> _registerValidator;
        private readonly ILogger<UserController> _logger;

        public UserController(
            AppDbContext context,
            TokenService tokenService,
            IFileService fileService,
            IPasswordService passwordService,
            IValidator<UserCreateDTO> createValidator,
            IValidator<UserUpdateDTO> updateValidator,
            IValidator<UserRegisterDTO> registerValidator,
            ILogger<UserController> logger)
        {
            _context = context;
            _tokenService = tokenService;
            _fileService = fileService;
            _passwordService = passwordService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
            _registerValidator = registerValidator;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        [HttpPost]
        [ActionName("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDTO dto, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Email and password are required."
                });
            }

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var user = await _context.Users
                .Include(u => u.UserType)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

            if (user == null || (user.IsDeleted == true) || !user.IsActive)
            {
                return Unauthorized(new APIResponse<object>
                {
                    Success = false,
                    Message = "Invalid credentials or account is inactive."
                });
            }

            if (!_passwordService.VerifyPassword(user.Password, dto.Password, out var rehashNeeded))
            {
                return Unauthorized(new APIResponse<object>
                {
                    Success = false,
                    Message = "Invalid credentials or account is inactive."
                });
            }

            // Safe transparent migration of legacy plaintext password to secure hash
            if (rehashNeeded)
            {
                try
                {
                    user.Password = _passwordService.HashPassword(dto.Password);
                    await _context.SaveChangesAsync(cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to update legacy password hash for user {Email}", user.Email);
                }
            }

            var token = _tokenService.GenerateToken(user);
            var userRead = new UserReadDTO
            {
                UserId = user.UserId,
                UserTypeId = user.UserTypeId,
                UserTypeName = user.UserType?.UserTypeName,
                FullName = user.FullName,
                UserCode = user.UserCode,
                Email = user.Email,
                MobileNumber = user.MobileNumber,
                ProfilePicturePath = user.ProfilePicturePath,
                IsActive = user.IsActive,
                IsDeleted = user.IsDeleted
            };

            return Ok(new APIResponse<AuthResponseDTO>
            {
                Success = true,
                Message = "Login successful",
                Data = new AuthResponseDTO
                {
                    Token = token,
                    User = userRead
                }
            });
        }

        [AllowAnonymous]
        [HttpPost("register")]
        [HttpPost]
        [ActionName("register")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] UserRegisterDTO dto, CancellationToken cancellationToken)
        {
            var validationResult = await _registerValidator.ValidateAsync(dto, cancellationToken);
            if (!validationResult.IsValid)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Registration validation failed",
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            // Public registration can NEVER create an Admin account
            if (string.Equals(dto.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Admin registration is not allowed."
                });
            }

            // Find matching UserType in database
            var targetRoleName = string.Equals(dto.Role, "Faculty", StringComparison.OrdinalIgnoreCase) ? "Faculty" : "Student";
            var userType = await _context.UserType
                .FirstOrDefaultAsync(ut => ut.UserTypeName.ToLower() == targetRoleName.ToLower(), cancellationToken);

            if (userType == null)
            {
                return StatusCode(500, new APIResponse<object>
                {
                    Success = false,
                    Message = $"System user type '{targetRoleName}' is not configured in the database."
                });
            }

            string? uploadedPath = null;
            if (dto.ProfilePicture != null && dto.ProfilePicture.Length > 0)
            {
                uploadedPath = await _fileService.UploadFileAsync(dto.ProfilePicture, "Users", cancellationToken);
            }

            var userCode = targetRoleName == "Student"
                ? dto.EnrollmentNumber
                : dto.FacultyId;

            var hashedPassword = _passwordService.HashPassword(dto.Password);

            // Faculty accounts are created with IsActive=true (or require institutional approval if configured)
            var newUser = new User
            {
                UserTypeId = userType.UserTypeId,
                FullName = dto.FullName.Trim(),
                UserCode = userCode?.Trim(),
                Email = dto.Email.Trim().ToLowerInvariant(),
                Password = hashedPassword,
                MobileNumber = dto.MobileNumber.Trim(),
                ProfilePicturePath = uploadedPath ?? string.Empty,
                IsActive = true,
                IsDeleted = false
            };

            await _context.Users.AddAsync(newUser, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            // Also associate with Role table if matching role exists
            var matchingRole = await _context.Role
                .FirstOrDefaultAsync(r => r.RoleName.ToLower() == targetRoleName.ToLower(), cancellationToken);
            if (matchingRole != null)
            {
                var userRole = new UserRole
                {
                    UserId = newUser.UserId,
                    RoleId = matchingRole.RoleId
                };
                await _context.UserRole.AddAsync(userRole, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
            }

            var result = new UserReadDTO
            {
                UserId = newUser.UserId,
                UserTypeId = newUser.UserTypeId,
                UserTypeName = userType.UserTypeName,
                FullName = newUser.FullName,
                UserCode = newUser.UserCode,
                Email = newUser.Email,
                MobileNumber = newUser.MobileNumber,
                ProfilePicturePath = newUser.ProfilePicturePath,
                IsActive = newUser.IsActive,
                IsDeleted = newUser.IsDeleted
            };

            return Ok(new APIResponse<UserReadDTO>
            {
                Success = true,
                Message = "Registration successful. You can now log in.",
                Data = result
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        [ActionName("GetAll")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var users = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserType)
                .Where(u => u.IsDeleted != true)
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
                }).ToListAsync(cancellationToken);

            return Ok(new APIResponse<List<UserReadDTO>>
            {
                Success = true,
                Message = "Get all users successfully",
                Data = users
            });
        }

        [Authorize]
        [HttpGet("{id:int}")]
        [ActionName("GetById")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            // Object-level authorization check: Non-admins can only view their own profile
            if (!string.Equals(currentUserRole, "Admin", StringComparison.OrdinalIgnoreCase) && currentUserId != id)
            {
                return Forbid();
            }

            var user = await _context.Users
                .AsNoTracking()
                .Include(u => u.UserType)
                .Where(u => u.UserId == id && u.IsDeleted != true)
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
                .FirstOrDefaultAsync(cancellationToken);

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

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ActionName("Add")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Add([FromForm] UserCreateDTO dto, CancellationToken cancellationToken)
        {
            var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
            if (!validationResult.IsValid)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            string? uploadedPath = null;
            if (dto.ProfilePicturePath != null && dto.ProfilePicturePath.Length > 0)
            {
                uploadedPath = await _fileService.UploadFileAsync(dto.ProfilePicturePath, "Users", cancellationToken);
            }

            try
            {
                var user = new User
                {
                    UserTypeId = dto.UserTypeId,
                    FullName = dto.FullName.Trim(),
                    UserCode = dto.UserCode?.Trim(),
                    Email = dto.Email.Trim().ToLowerInvariant(),
                    Password = _passwordService.HashPassword(dto.Password),
                    MobileNumber = dto.MobileNumber.Trim(),
                    ProfilePicturePath = uploadedPath ?? string.Empty,
                    IsActive = dto.IsActive,
                    IsDeleted = false
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync(cancellationToken);

                var userType = await _context.UserType.FindAsync(new object[] { user.UserTypeId }, cancellationToken);

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
                _logger.LogError(ex, "Error occurred while adding user");
                return BadRequest(new APIResponse<UserReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize]
        [HttpPut("{id:int}")]
        [ActionName("Update")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] UserUpdateDTO dto, CancellationToken cancellationToken)
        {
            if (id != dto.UserId)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "ID mismatch."
                });
            }

            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();
            var isAdmin = string.Equals(currentUserRole, "Admin", StringComparison.OrdinalIgnoreCase);

            // Object-level permission check: Non-admins can only update their own profile
            if (!isAdmin && currentUserId != id)
            {
                return Forbid();
            }

            var validationResult = await _updateValidator.ValidateAsync(dto, cancellationToken);
            if (!validationResult.IsValid)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList()
                });
            }

            var existingUser = await _context.Users.FindAsync(new object[] { id }, cancellationToken);
            if (existingUser == null || existingUser.IsDeleted == true)
            {
                return NotFound(new APIResponse<object>
                {
                    Success = false,
                    Message = "User not found."
                });
            }

            try
            {
                if (dto.ProfilePicturePath != null && dto.ProfilePicturePath.Length > 0)
                {
                    _fileService.DeleteFile(existingUser.ProfilePicturePath);
                    existingUser.ProfilePicturePath = await _fileService.UploadFileAsync(dto.ProfilePicturePath, "Users", cancellationToken);
                }

                // Protect role escalation: Only Admin can change UserTypeId, IsActive, and IsDeleted
                if (isAdmin)
                {
                    existingUser.UserTypeId = dto.UserTypeId;
                    existingUser.IsActive = dto.IsActive;
                    if (dto.IsDeleted.HasValue)
                    {
                        existingUser.IsDeleted = dto.IsDeleted;
                    }
                }

                existingUser.FullName = dto.FullName.Trim();
                existingUser.UserCode = dto.UserCode?.Trim();
                
                // Only admin can change email, or owner if email is unchanged
                if (isAdmin || string.Equals(existingUser.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
                {
                    existingUser.Email = dto.Email.Trim().ToLowerInvariant();
                }

                // Do not overwrite password when empty
                if (!string.IsNullOrWhiteSpace(dto.Password))
                {
                    existingUser.Password = _passwordService.HashPassword(dto.Password);
                }

                existingUser.MobileNumber = dto.MobileNumber.Trim();

                _context.Users.Update(existingUser);
                await _context.SaveChangesAsync(cancellationToken);

                var userType = await _context.UserType.FindAsync(new object[] { existingUser.UserTypeId }, cancellationToken);

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
                _logger.LogError(ex, "Error occurred while updating user {Id}", id);
                return BadRequest(new APIResponse<UserReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        [ActionName("Delete")]
        public async Task<IActionResult> Delete(int id, [FromQuery] bool deleteFileOnly = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _context.Users.FindAsync(new object[] { id }, cancellationToken);
                if (user == null || user.IsDeleted == true)
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
                    await _context.SaveChangesAsync(cancellationToken);

                    return Ok(new APIResponse<object>
                    {
                        Success = true,
                        Message = "Document deleted successfully."
                    });
                }

                _fileService.DeleteFile(user.ProfilePicturePath);
                
                // Soft delete to protect referential integrity
                user.IsDeleted = true;
                user.IsActive = false;
                await _context.SaveChangesAsync(cancellationToken);

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "User deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting user {Id}", id);
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting user",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        private int? GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("userId")?.Value;
            return int.TryParse(claim, out var id) ? id : null;
        }

        private string? GetCurrentUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value
                ?? User.FindFirst("role")?.Value;
        }
    }
}
