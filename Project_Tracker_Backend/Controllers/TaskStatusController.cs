using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using TaskStatus = Project_Tracker_Backend.Models.TaskStatus;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TaskStatusController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskStatusController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var taskStatuses = await _context.TaskStatus
                .Select(ts => new TaskStatusReadDTO
                {
                    TaskStatusID = ts.TaskStatusID,
                    TaskStatusName = ts.TaskStatusName,
                    TaskStatusCssClass = ts.TaskStatusCssClass
                }).ToListAsync();

            return Ok(taskStatuses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var taskStatus = await _context.TaskStatus
                .Where(ts => ts.TaskStatusID == id)
                .Select(ts => new TaskStatusReadDTO
                {
                    TaskStatusID = ts.TaskStatusID,
                    TaskStatusName = ts.TaskStatusName,
                    TaskStatusCssClass = ts.TaskStatusCssClass
                })
                .FirstOrDefaultAsync();

            if (taskStatus == null)
                return NotFound();

            return Ok(taskStatus);
        }

        [HttpPost]
        public async Task<IActionResult> Add(TaskStatusCreateDTO dto)
        {
            var taskStatus = new TaskStatus
            {
                TaskStatusName = dto.TaskStatusName,
                TaskStatusCssClass = dto.TaskStatusCssClass
            };

            _context.TaskStatus.Add(taskStatus);
            await _context.SaveChangesAsync();

            var result = new TaskStatusReadDTO
            {
                TaskStatusID = taskStatus.TaskStatusID,
                TaskStatusName = taskStatus.TaskStatusName,
                TaskStatusCssClass = taskStatus.TaskStatusCssClass
            };

            return CreatedAtAction(nameof(GetById), new { id = taskStatus.TaskStatusID }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TaskStatusUpdateDTO dto)
        {
            var existingTaskStatus = await _context.TaskStatus.FindAsync(id);

            if (existingTaskStatus == null)
                return NotFound();

            existingTaskStatus.TaskStatusName = dto.TaskStatusName;
            existingTaskStatus.TaskStatusCssClass = dto.TaskStatusCssClass;

            await _context.SaveChangesAsync();

            var result = new TaskStatusReadDTO
            {
                TaskStatusID = existingTaskStatus.TaskStatusID,
                TaskStatusName = existingTaskStatus.TaskStatusName,
                TaskStatusCssClass = existingTaskStatus.TaskStatusCssClass
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var taskStatus = await _context.TaskStatus.FindAsync(id);

            if (taskStatus == null)
            {
                return NotFound();
            }

            _context.TaskStatus.Remove(taskStatus);
            await _context.SaveChangesAsync();

            return Ok("Task Status deleted successfully.");
        }
    }
}