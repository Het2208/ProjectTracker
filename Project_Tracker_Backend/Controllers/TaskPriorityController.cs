using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TaskPriorityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskPriorityController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var taskPriorities = await _context.TaskPriority
                .Select(tp => new TaskPriorityReadDTO
                {
                    TaskPriorityId = tp.TaskPriorityId,
                    TaskPriorityName = tp.TaskPriorityName,
                    TaskPriorityCssClass = tp.TaskPriorityCssClass
                }).ToListAsync();

            return Ok(taskPriorities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var taskPriority = await _context.TaskPriority
                .Where(tp => tp.TaskPriorityId == id)
                .Select(tp => new TaskPriorityReadDTO
                {
                    TaskPriorityId = tp.TaskPriorityId,
                    TaskPriorityName = tp.TaskPriorityName,
                    TaskPriorityCssClass = tp.TaskPriorityCssClass
                })
                .FirstOrDefaultAsync();

            if (taskPriority == null)
                return NotFound();

            return Ok(taskPriority);
        }

        [HttpPost]
        public async Task<IActionResult> Add(TaskPriorityCreateDTO dto)
        {
            var taskPriority = new TaskPriority
            {
                TaskPriorityName = dto.TaskPriorityName,
                TaskPriorityCssClass = dto.TaskPriorityCssClass
            };

            _context.TaskPriority.Add(taskPriority);
            await _context.SaveChangesAsync();

            var result = new TaskPriorityReadDTO
            {
                TaskPriorityId = taskPriority.TaskPriorityId,
                TaskPriorityName = taskPriority.TaskPriorityName,
                TaskPriorityCssClass = taskPriority.TaskPriorityCssClass
            };

            return CreatedAtAction(nameof(GetById), new { id = taskPriority.TaskPriorityId }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TaskPriorityUpdateDTO dto)
        {
            var existingTaskPriority = await _context.TaskPriority.FindAsync(id);

            if (existingTaskPriority == null)
                return NotFound();

            existingTaskPriority.TaskPriorityName = dto.TaskPriorityName;
            existingTaskPriority.TaskPriorityCssClass = dto.TaskPriorityCssClass;

            await _context.SaveChangesAsync();

            var result = new TaskPriorityReadDTO
            {
                TaskPriorityId = existingTaskPriority.TaskPriorityId,
                TaskPriorityName = existingTaskPriority.TaskPriorityName,
                TaskPriorityCssClass = existingTaskPriority.TaskPriorityCssClass
            };

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var taskPriority = await _context.TaskPriority.FindAsync(id);

            if (taskPriority == null)
            {
                return NotFound();
            }

            _context.TaskPriority.Remove(taskPriority);
            await _context.SaveChangesAsync();

            return Ok("Task Priority deleted successfully.");
        }
    }
}
