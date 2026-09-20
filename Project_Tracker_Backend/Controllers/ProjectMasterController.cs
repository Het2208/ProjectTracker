using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Comman;

namespace Project_Tracker_Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ProjectMasterController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<ProjectMasterCreateDTO> _createValidator;
        private readonly IValidator<ProjectMasterUpdateDTO> _updateValidator;

        public ProjectMasterController(
            AppDbContext context,
            IValidator<ProjectMasterCreateDTO> createValidator,
            IValidator<ProjectMasterUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
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

            return Ok(new APIResponse<List<ProjectMasterReadDTO>>
            {
                Success = true,
                Message = "Get all projects successfully",
                Data = projects
            });
        }

        [HttpGet("{id:int}")]
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
            {
                return NotFound(new APIResponse<ProjectMasterReadDTO>
                {
                    Success = false,
                    Message = "Project not found"
                });
            }

            return Ok(new APIResponse<ProjectMasterReadDTO>
            {
                Success = true,
                Message = "Project retrieved successfully",
                Data = project
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Add(ProjectMasterCreateDTO dto)
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

                return Ok(new APIResponse<ProjectMasterReadDTO>
                {
                    Success = true,
                    Message = "Project Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<ProjectMasterReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding project",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ProjectMasterUpdateDTO dto)
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
                var existingProject = await _context.ProjectMaster.FindAsync(id);

                if (existingProject == null)
                {
                    return NotFound(new APIResponse<ProjectMasterReadDTO>
                    {
                        Success = false,
                        Message = "Project not found"
                    });
                }

                existingProject.ProjectTitle = dto.ProjectTitle;
                existingProject.Description = dto.Description;

                await _context.SaveChangesAsync();

                var result = new ProjectMasterReadDTO
                {
                    ProjectId = existingProject.ProjectId,
                    ProjectTitle = existingProject.ProjectTitle,
                    Description = existingProject.Description
                };

                return Ok(new APIResponse<ProjectMasterReadDTO>
                {
                    Success = true,
                    Message = "Project Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<ProjectMasterReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating project",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var project = await _context.ProjectMaster.FindAsync(id);

                if (project == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "Project not found"
                    });
                }

                _context.ProjectMaster.Remove(project);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "Project deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting project",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}