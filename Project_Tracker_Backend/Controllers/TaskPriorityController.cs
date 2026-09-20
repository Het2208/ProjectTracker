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
    [Route("api/[controller]")]
    [ApiController]
    public class TaskPriorityController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<TaskPriorityCreateDTO> _createValidator;
        private readonly IValidator<TaskPriorityUpdateDTO> _updateValidator;

        public TaskPriorityController(
            AppDbContext context,
            IValidator<TaskPriorityCreateDTO> createValidator,
            IValidator<TaskPriorityUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
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

            return Ok(new APIResponse<List<TaskPriorityReadDTO>>
            {
                Success = true,
                Message = "Get all task priorities successfully",
                Data = taskPriorities
            });
        }

        [HttpGet("{id:int}")]
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
            {
                return NotFound(new APIResponse<TaskPriorityReadDTO>
                {
                    Success = false,
                    Message = "Task priority not found"
                });
            }

            return Ok(new APIResponse<TaskPriorityReadDTO>
            {
                Success = true,
                Message = "Task priority retrieved successfully",
                Data = taskPriority
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Add(TaskPriorityCreateDTO dto)
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

                return Ok(new APIResponse<TaskPriorityReadDTO>
                {
                    Success = true,
                    Message = "Task Priority Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<TaskPriorityReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding task priority",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, TaskPriorityUpdateDTO dto)
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
                var existingTaskPriority = await _context.TaskPriority.FindAsync(id);

                if (existingTaskPriority == null)
                {
                    return NotFound(new APIResponse<TaskPriorityReadDTO>
                    {
                        Success = false,
                        Message = "Task priority not found"
                    });
                }

                existingTaskPriority.TaskPriorityName = dto.TaskPriorityName;
                existingTaskPriority.TaskPriorityCssClass = dto.TaskPriorityCssClass;

                await _context.SaveChangesAsync();

                var result = new TaskPriorityReadDTO
                {
                    TaskPriorityId = existingTaskPriority.TaskPriorityId,
                    TaskPriorityName = existingTaskPriority.TaskPriorityName,
                    TaskPriorityCssClass = existingTaskPriority.TaskPriorityCssClass
                };

                return Ok(new APIResponse<TaskPriorityReadDTO>
                {
                    Success = true,
                    Message = "Task Priority Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<TaskPriorityReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating task priority",
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
                var taskPriority = await _context.TaskPriority.FindAsync(id);

                if (taskPriority == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "Task priority not found"
                    });
                }

                _context.TaskPriority.Remove(taskPriority);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "Task Priority deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting task priority",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}