using Microsoft.AspNetCore.Mvc;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.Models;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoleController(AppDbContext context)
        {
            _context = context;
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
                }).ToListAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
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
                return NotFound();

            return Ok(role);
        }

        [HttpPost]
        public async Task<IActionResult> Add(RoleCreateDTO dto)
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

            return CreatedAtAction(nameof(GetById), new { id = role.RoleId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, RoleUpdateDTO dto)
        {
            var existingRole = await _context.Role.FindAsync(id);

            if (existingRole == null)
                return NotFound();

            existingRole.RoleName = dto.RoleName;
            existingRole.Description = dto.Description;

            await _context.SaveChangesAsync();

            var result = new RoleReadDTO
            {
                RoleId = existingRole.RoleId,
                RoleName = existingRole.RoleName,
                Description = existingRole.Description
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _context.Role.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }
            _context.Role.Remove(role);
            await _context.SaveChangesAsync();
            return Ok("Role deleted successfully.");
        }
    }
}
