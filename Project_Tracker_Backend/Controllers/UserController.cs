using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
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

            return Ok(users);
        }

        [HttpGet("{id}")]
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
                return NotFound();

            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Add(UserCreateDTO dto)
        {
            var user = new User
            {
                UserTypeId = dto.UserTypeId,
                FullName = dto.FullName,
                UserCode = dto.UserCode,
                Email = dto.Email,
                Password = dto.Password,
                MobileNumber = dto.MobileNumber,
                ProfilePicturePath = dto.ProfilePicturePath,
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

            return CreatedAtAction(nameof(GetById), new { id = user.UserId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserUpdateDTO dto)
        {
            var existingUser = await _context.Users.FindAsync(id);

            if (existingUser == null)
                return NotFound();

            existingUser.UserTypeId = dto.UserTypeId;
            existingUser.FullName = dto.FullName;
            existingUser.UserCode = dto.UserCode;
            existingUser.Email = dto.Email;
            if (!string.IsNullOrEmpty(dto.Password))
            {
                existingUser.Password = dto.Password;
            }
            existingUser.MobileNumber = dto.MobileNumber;
            existingUser.ProfilePicturePath = dto.ProfilePicturePath;
            existingUser.IsActive = dto.IsActive;
            existingUser.IsDeleted = dto.IsDeleted;

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

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("User deleted successfully.");
        }
    }
}
