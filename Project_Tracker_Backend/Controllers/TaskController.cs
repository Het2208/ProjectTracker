using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<Project_Tracker_Backend.Models.Task>> GetALl()
        {
            var Tasks = await _context.Task.ToListAsync();
            return Ok(Tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project_Tracker_Backend.Models.Task>> GetById(int id)
        {
            var task = await _context.Task.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            return Ok(task);
        }
        [HttpPost]
        public async Task<ActionResult<Project_Tracker_Backend.Models.Task>> Add(Project_Tracker_Backend.Models.Task task)
        {
            task.TaskID = 0;
            _context.Task.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = task.TaskID }, task);
        }
        [HttpPut("{id}")]
        public async Task<ActionResult<Project_Tracker_Backend.Models.Task>> Update(int id, Project_Tracker_Backend.Models.Task task)
        {

            if (task.TaskID != 0 && task.TaskID != id)
            {
                return BadRequest("ID in route parameter does not match ID in request body.");
            }

            var existingTask = await _context.Task.FindAsync(id);

            if (existingTask == null)
            {
                return NotFound();
            }

            existingTask.ProjectAllocationID = task.ProjectAllocationID;
            existingTask.TaskTitle = task.TaskTitle;
            existingTask.TaskDescription = task.TaskDescription;
            existingTask.TaskStatusID = task.TaskStatusID;
            existingTask.TaskPriorityID = task.TaskPriorityID;
            existingTask.AssignedScore = task.AssignedScore;
            existingTask.EarnedScore = task.EarnedScore;
            existingTask.ProgressPercentage = task.ProgressPercentage;
            existingTask.TaskAssignedDate = task.TaskAssignedDate;
            existingTask.TaskStartDate = task.TaskStartDate;
            existingTask.TaskDueDate = task.TaskDueDate;
            existingTask.TaskCompletedDate = task.TaskCompletedDate;
            existingTask.NextFollowUpDate = task.NextFollowUpDate;
            existingTask.FacultyRemarks = task.FacultyRemarks;
            existingTask.StudentRemarks = task.StudentRemarks;

            await _context.SaveChangesAsync();

            return Ok(existingTask);


        }
        [HttpDelete("{id}")]

        public async Task<ActionResult<Project_Tracker_Backend.Models.Task>> Delete(int id)
        {
            var task = await _context.Task.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            _context.Task.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
