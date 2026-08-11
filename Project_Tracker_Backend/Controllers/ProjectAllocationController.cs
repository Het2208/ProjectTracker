using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ProjectAllocationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectAllocationController(AppDbContext context)
        {
            _context = context;
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

            return Ok(projectAllocations);
        }

        [HttpGet("{id}")]
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
                return NotFound();

            return Ok(pa);
        }

        [HttpPost]
        public async Task<IActionResult> Add(ProjectAllocationCreateDTO dto)
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

            return CreatedAtAction(nameof(GetById), new { id = pa.ProjectAllocationID }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProjectAllocationUpdateDTO dto)
        {
            var existingPA = await _context.ProjectAllocation.FindAsync(id);

            if (existingPA == null)
                return NotFound();

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

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pa = await _context.ProjectAllocation.FindAsync(id);

            if (pa == null)
            {
                return NotFound();
            }

            _context.ProjectAllocation.Remove(pa);
            await _context.SaveChangesAsync();

            return Ok("Project allocation deleted successfully.");
        }
    }
}