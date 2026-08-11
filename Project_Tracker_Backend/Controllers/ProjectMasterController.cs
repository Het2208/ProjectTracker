using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ProjectMasterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectMasterController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _context.ProjectMaster
                .Select(p => new ProjectMasterReadDTO
                {
                    ProjectId = p.ProjectId,
                    ProjectTitle = p.ProjectTitle,
                    Description = p.Description
                }).ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var project = await _context.ProjectMaster
                .Where(p => p.ProjectId == id)
                .Select(p => new ProjectMasterReadDTO
                {
                    ProjectId = p.ProjectId,
                    ProjectTitle = p.ProjectTitle,
                    Description = p.Description
                })
                .FirstOrDefaultAsync();

            if (project == null)
                return NotFound();

            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> Add(ProjectMasterCreateDTO dto)
        {
            var project = new ProjectMaster
            {
                ProjectTitle = dto.ProjectTitle,
                Description = dto.Description
            };

            _context.ProjectMaster.Add(project);
            await _context.SaveChangesAsync();

            var result = new ProjectMasterReadDTO
            {
                ProjectId = project.ProjectId,
                ProjectTitle = project.ProjectTitle,
                Description = project.Description
            };

            return CreatedAtAction(nameof(GetById), new { id = project.ProjectId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProjectMasterUpdateDTO dto)
        {
            var existingProject = await _context.ProjectMaster.FindAsync(id);

            if (existingProject == null)
                return NotFound();

            existingProject.ProjectTitle = dto.ProjectTitle;
            existingProject.Description = dto.Description;

            await _context.SaveChangesAsync();

            var result = new ProjectMasterReadDTO
            {
                ProjectId = existingProject.ProjectId,
                ProjectTitle = existingProject.ProjectTitle,
                Description = existingProject.Description
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var project = await _context.ProjectMaster.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            _context.ProjectMaster.Remove(project);
            await _context.SaveChangesAsync();

            return Ok("Project deleted successfully.");
        }
    }
}