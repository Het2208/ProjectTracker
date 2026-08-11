using Microsoft.AspNetCore.Mvc;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.Models;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class UserTypeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserTypeController(AppDbContext context)
        {
            _context = context;
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
            return Ok(userTypes);
        }

        [HttpGet("{id}")]
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
                return NotFound();
            }

            return Ok(userType);
        }

        [HttpPost]
        public async Task<IActionResult> Add(UserTypeCreateDTO dto)
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

            return CreatedAtAction(nameof(GetById), new { id = newUserType.UserTypeId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserTypeUpdateDTO dto)
        {
            var existingUserType = await _context.UserType.FindAsync(id);

            if (existingUserType == null)
                return NotFound();

            existingUserType.UserTypeName = dto.UserTypeName;
            existingUserType.Description = dto.Description;

            await _context.SaveChangesAsync();

            var result = new UserTypeReadDTO
            {
                UserTypeID = existingUserType.UserTypeId,
                UserTypeName = existingUserType.UserTypeName,
                Description = existingUserType.Description
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userType = await _context.UserType.FindAsync(id);

            if (userType == null)
            {
                return NotFound();
            }

            _context.UserType.Remove(userType);
            await _context.SaveChangesAsync();

            return Ok("User Type deleted successfully.");
        }
    }
}