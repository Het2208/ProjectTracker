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
    public class ProjectAllocationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<ProjectAllocationCreateDTO> _createValidator;
        private readonly IValidator<ProjectAllocationUpdateDTO> _updateValidator;

        public ProjectAllocationController(
            AppDbContext context,
            IValidator<ProjectAllocationCreateDTO> createValidator,
            IValidator<ProjectAllocationUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var projectAllocations = await _context.ProjectAllocation
                .Include(pa => pa.ProjectMaster)
                .Include(pa => pa.Student)
                .Include(pa => pa.Faculty)
                .Select(pa => new ProjectAllocationReadDTO
                {
                    ProjectAllocationID = pa.ProjectAllocationID,
                    ProjectID = pa.ProjectID,
                    ProjectTitle = pa.ProjectMaster != null ? pa.ProjectMaster.ProjectTitle : null,
                    StudentID = pa.StudentID,
                    StudentName = pa.Student != null ? pa.Student.FullName : null,
                    FacultyID = pa.FacultyID,
                    FacultyName = pa.Faculty != null ? pa.Faculty.FullName : null,
                    AssignedDate = pa.AssignedDate,
                    ProjectStartDate = pa.ProjectStartDate,
                    ProjectEndDate = pa.ProjectEndDate,
                    TotalTasksGiven = pa.TotalTasksGiven,
                    TotalCompletedTasks = pa.TotalCompletedTasks,
                    ProgressPercentage = pa.ProgressPercentage,
                    OverAllGrade = pa.OverAllGrade
                }).ToListAsync();

            return Ok(new APIResponse<List<ProjectAllocationReadDTO>>
            {
                Success = true,
                Message = "Get all project allocations successfully",
                Data = projectAllocations
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pa = await _context.ProjectAllocation
                .Include(pa => pa.ProjectMaster)
                .Include(pa => pa.Student)
                .Include(pa => pa.Faculty)
                .Where(pa => pa.ProjectAllocationID == id)
                .Select(pa => new ProjectAllocationReadDTO
                {
                    ProjectAllocationID = pa.ProjectAllocationID,
                    ProjectID = pa.ProjectID,
                    ProjectTitle = pa.ProjectMaster != null ? pa.ProjectMaster.ProjectTitle : null,
                    StudentID = pa.StudentID,
                    StudentName = pa.Student != null ? pa.Student.FullName : null,
                    FacultyID = pa.FacultyID,
                    FacultyName = pa.Faculty != null ? pa.Faculty.FullName : null,
                    AssignedDate = pa.AssignedDate,
                    ProjectStartDate = pa.ProjectStartDate,
                    ProjectEndDate = pa.ProjectEndDate,
                    TotalTasksGiven = pa.TotalTasksGiven,
                    TotalCompletedTasks = pa.TotalCompletedTasks,
                    ProgressPercentage = pa.ProgressPercentage,
                    OverAllGrade = pa.OverAllGrade
                })
                .FirstOrDefaultAsync();

            if (pa == null)
            {
                return NotFound(new APIResponse<ProjectAllocationReadDTO>
                {
                    Success = false,
                    Message = "Project allocation not found"
                });
            }

            return Ok(new APIResponse<ProjectAllocationReadDTO>
            {
                Success = true,
                Message = "Project allocation retrieved successfully",
                Data = pa
            });
        }

        [Authorize(Roles = "Admin,Faculty")]
        [HttpPost]
        public async Task<IActionResult> Add(ProjectAllocationCreateDTO dto)
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
                var pa = new ProjectAllocation
                {
                    ProjectID = dto.ProjectID,
                    StudentID = dto.StudentID,
                    FacultyID = dto.FacultyID,
                    AssignedDate = dto.AssignedDate,
                    ProjectStartDate = dto.ProjectStartDate,
                    ProjectEndDate = dto.ProjectEndDate,
                    TotalTasksGiven = dto.TotalTasksGiven,
                    TotalCompletedTasks = dto.TotalCompletedTasks,
                    ProgressPercentage = dto.ProgressPercentage,
                    OverAllGrade = dto.OverAllGrade
                };

                _context.ProjectAllocation.Add(pa);
                await _context.SaveChangesAsync();

                var project = await _context.ProjectMaster.FindAsync(pa.ProjectID);
                var student = await _context.Users.FindAsync(pa.StudentID);
                var faculty = await _context.Users.FindAsync(pa.FacultyID);

                var result = new ProjectAllocationReadDTO
                {
                    ProjectAllocationID = pa.ProjectAllocationID,
                    ProjectID = pa.ProjectID,
                    ProjectTitle = project?.ProjectTitle,
                    StudentID = pa.StudentID,
                    StudentName = student?.FullName,
                    FacultyID = pa.FacultyID,
                    FacultyName = faculty?.FullName,
                    AssignedDate = pa.AssignedDate,
                    ProjectStartDate = pa.ProjectStartDate,
                    ProjectEndDate = pa.ProjectEndDate,
                    TotalTasksGiven = pa.TotalTasksGiven,
                    TotalCompletedTasks = pa.TotalCompletedTasks,
                    ProgressPercentage = pa.ProgressPercentage,
                    OverAllGrade = pa.OverAllGrade
                };

                return Ok(new APIResponse<ProjectAllocationReadDTO>
                {
                    Success = true,
                    Message = "Project Allocation Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<ProjectAllocationReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding project allocation",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize(Roles = "Admin,Faculty")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, ProjectAllocationUpdateDTO dto)
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
                var existingPA = await _context.ProjectAllocation.FindAsync(id);

                if (existingPA == null)
                {
                    return NotFound(new APIResponse<ProjectAllocationReadDTO>
                    {
                        Success = false,
                        Message = "Project allocation not found"
                    });
                }

                existingPA.ProjectID = dto.ProjectID;
                existingPA.StudentID = dto.StudentID;
                existingPA.FacultyID = dto.FacultyID;
                existingPA.ProjectStartDate = dto.ProjectStartDate;
                existingPA.ProjectEndDate = dto.ProjectEndDate;
                existingPA.TotalTasksGiven = dto.TotalTasksGiven;
                existingPA.TotalCompletedTasks = dto.TotalCompletedTasks;
                existingPA.ProgressPercentage = dto.ProgressPercentage;
                existingPA.OverAllGrade = dto.OverAllGrade;

                await _context.SaveChangesAsync();

                var project = await _context.ProjectMaster.FindAsync(existingPA.ProjectID);
                var student = await _context.Users.FindAsync(existingPA.StudentID);
                var faculty = await _context.Users.FindAsync(existingPA.FacultyID);

                var result = new ProjectAllocationReadDTO
                {
                    ProjectAllocationID = existingPA.ProjectAllocationID,
                    ProjectID = existingPA.ProjectID,
                    ProjectTitle = project?.ProjectTitle,
                    StudentID = existingPA.StudentID,
                    StudentName = student?.FullName,
                    FacultyID = existingPA.FacultyID,
                    FacultyName = faculty?.FullName,
                    AssignedDate = existingPA.AssignedDate,
                    ProjectStartDate = existingPA.ProjectStartDate,
                    ProjectEndDate = existingPA.ProjectEndDate,
                    TotalTasksGiven = existingPA.TotalTasksGiven,
                    TotalCompletedTasks = existingPA.TotalCompletedTasks,
                    ProgressPercentage = existingPA.ProgressPercentage,
                    OverAllGrade = existingPA.OverAllGrade
                };

                return Ok(new APIResponse<ProjectAllocationReadDTO>
                {
                    Success = true,
                    Message = "Project Allocation Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<ProjectAllocationReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating project allocation",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize(Roles = "Admin,Faculty")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var pa = await _context.ProjectAllocation.FindAsync(id);

                if (pa == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "Project allocation not found"
                    });
                }

                _context.ProjectAllocation.Remove(pa);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "Project allocation deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting project allocation",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}