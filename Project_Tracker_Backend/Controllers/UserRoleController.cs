using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserRoleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserRoleController(AppDbContext context)
        {
            _context = context;
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

            return Ok(userRoles);
        }

        [HttpGet("{id}")]
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
                return NotFound();

            return Ok(userRole);
        }

        [HttpPost]
        public async Task<IActionResult> Add(UserRoleCreateDTO dto)
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

            return CreatedAtAction(nameof(GetById), new { id = userRole.RolePermissionId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserRoleUpdateDTO dto)
        {
            var existingUserRole = await _context.UserRole.FindAsync(id);

            if (existingUserRole == null)
                return NotFound();

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

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userRole = await _context.UserRole.FindAsync(id);
            if (userRole == null)
            {
                return NotFound();
            }

            _context.UserRole.Remove(userRole);
            await _context.SaveChangesAsync();

            return Ok("User Role link deleted successfully.");
        }
    }
}
