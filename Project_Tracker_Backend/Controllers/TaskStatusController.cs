using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Comman;
using TaskStatus = Project_Tracker_Backend.Models.TaskStatus;

namespace Project_Tracker_Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TaskStatusController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<TaskStatusCreateDTO> _createValidator;
        private readonly IValidator<TaskStatusUpdateDTO> _updateValidator;

        public TaskStatusController(
            AppDbContext context,
            IValidator<TaskStatusCreateDTO> createValidator,
            IValidator<TaskStatusUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
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

            return Ok(new APIResponse<List<TaskStatusReadDTO>>
            {
                Success = true,
                Message = "Get all task statuses successfully",
                Data = taskStatuses
            });
        }

        [HttpGet("{id:int}")]
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
            {
                return NotFound(new APIResponse<TaskStatusReadDTO>
                {
                    Success = false,
                    Message = "Task status not found"
                });
            }

            return Ok(new APIResponse<TaskStatusReadDTO>
            {
                Success = true,
                Message = "Task status retrieved successfully",
                Data = taskStatus
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Add(TaskStatusCreateDTO dto)
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

                return Ok(new APIResponse<TaskStatusReadDTO>
                {
                    Success = true,
                    Message = "Task Status Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<TaskStatusReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding task status",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, TaskStatusUpdateDTO dto)
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
                var existingTaskStatus = await _context.TaskStatus.FindAsync(id);

                if (existingTaskStatus == null)
                {
                    return NotFound(new APIResponse<TaskStatusReadDTO>
                    {
                        Success = false,
                        Message = "Task status not found"
                    });
                }

                existingTaskStatus.TaskStatusName = dto.TaskStatusName;
                existingTaskStatus.TaskStatusCssClass = dto.TaskStatusCssClass;

                await _context.SaveChangesAsync();

                var result = new TaskStatusReadDTO
                {
                    TaskStatusID = existingTaskStatus.TaskStatusID,
                    TaskStatusName = existingTaskStatus.TaskStatusName,
                    TaskStatusCssClass = existingTaskStatus.TaskStatusCssClass
                };

                return Ok(new APIResponse<TaskStatusReadDTO>
                {
                    Success = true,
                    Message = "Task Status Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<TaskStatusReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating task status",
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
                var taskStatus = await _context.TaskStatus.FindAsync(id);

                if (taskStatus == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "Task status not found"
                    });
                }

                _context.TaskStatus.Remove(taskStatus);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "Task Status deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting task status",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}