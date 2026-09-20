using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Comman;
using Task = Project_Tracker_Backend.Models.Task;

namespace Project_Tracker_Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IValidator<TaskCreateDTO> _createValidator;
        private readonly IValidator<TaskUpdateDTO> _updateValidator;

        public TaskController(
            AppDbContext context,
            IValidator<TaskCreateDTO> createValidator,
            IValidator<TaskUpdateDTO> updateValidator)
        {
            _context = context;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _context.Task
                .Include(t => t.ProjectAllocation)
                    .ThenInclude(pa => pa.ProjectMaster)
                .Include(t => t.ProjectAllocation)
                    .ThenInclude(pa => pa.Student)
                .Include(t => t.TaskStatus)
                .Include(t => t.TaskPriority)
                .Select(t => new TaskReadDTO
                {
                    TaskID = t.TaskID,
                    ProjectAllocationID = t.ProjectAllocationID,
                    ProjectTitle = t.ProjectAllocation != null && t.ProjectAllocation.ProjectMaster != null ? t.ProjectAllocation.ProjectMaster.ProjectTitle : null,
                    StudentName = t.ProjectAllocation != null && t.ProjectAllocation.Student != null ? t.ProjectAllocation.Student.FullName : null,
                    TaskTitle = t.TaskTitle,
                    TaskDescription = t.TaskDescription,
                    TaskStatusID = t.TaskStatusID,
                    TaskStatusName = t.TaskStatus != null ? t.TaskStatus.TaskStatusName : null,
                    TaskPriorityID = t.TaskPriorityID,
                    TaskPriorityName = t.TaskPriority != null ? t.TaskPriority.TaskPriorityName : null,
                    AssignedScore = t.AssignedScore,
                    EarnedScore = t.EarnedScore,
                    ProgressPercentage = t.ProgressPercentage,
                    TaskAssignedDate = t.TaskAssignedDate,
                    TaskStartDate = t.TaskStartDate,
                    TaskDueDate = t.TaskDueDate,
                    TaskCompletedDate = t.TaskCompletedDate,
                    NextFollowUpDate = t.NextFollowUpDate,
                    FacultyRemarks = t.FacultyRemarks,
                    StudentRemarks = t.StudentRemarks
                }).ToListAsync();

            return Ok(new APIResponse<List<TaskReadDTO>>
            {
                Success = true,
                Message = "Get all tasks successfully",
                Data = tasks
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _context.Task
                .Include(t => t.ProjectAllocation)
                    .ThenInclude(pa => pa.ProjectMaster)
                .Include(t => t.ProjectAllocation)
                    .ThenInclude(pa => pa.Student)
                .Include(t => t.TaskStatus)
                .Include(t => t.TaskPriority)
                .Where(t => t.TaskID == id)
                .Select(t => new TaskReadDTO
                {
                    TaskID = t.TaskID,
                    ProjectAllocationID = t.ProjectAllocationID,
                    ProjectTitle = t.ProjectAllocation != null && t.ProjectAllocation.ProjectMaster != null ? t.ProjectAllocation.ProjectMaster.ProjectTitle : null,
                    StudentName = t.ProjectAllocation != null && t.ProjectAllocation.Student != null ? t.ProjectAllocation.Student.FullName : null,
                    TaskTitle = t.TaskTitle,
                    TaskDescription = t.TaskDescription,
                    TaskStatusID = t.TaskStatusID,
                    TaskStatusName = t.TaskStatus != null ? t.TaskStatus.TaskStatusName : null,
                    TaskPriorityID = t.TaskPriorityID,
                    TaskPriorityName = t.TaskPriority != null ? t.TaskPriority.TaskPriorityName : null,
                    AssignedScore = t.AssignedScore,
                    EarnedScore = t.EarnedScore,
                    ProgressPercentage = t.ProgressPercentage,
                    TaskAssignedDate = t.TaskAssignedDate,
                    TaskStartDate = t.TaskStartDate,
                    TaskDueDate = t.TaskDueDate,
                    TaskCompletedDate = t.TaskCompletedDate,
                    NextFollowUpDate = t.NextFollowUpDate,
                    FacultyRemarks = t.FacultyRemarks,
                    StudentRemarks = t.StudentRemarks
                })
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return NotFound(new APIResponse<TaskReadDTO>
                {
                    Success = false,
                    Message = "Task not found"
                });
            }

            return Ok(new APIResponse<TaskReadDTO>
            {
                Success = true,
                Message = "Task retrieved successfully",
                Data = task
            });
        }

        [Authorize(Roles = "Admin,Faculty")]
        [HttpPost]
        public async Task<IActionResult> Add(TaskCreateDTO dto)
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
                var task = new Task
                {
                    ProjectAllocationID = dto.ProjectAllocationID,
                    TaskTitle = dto.TaskTitle,
                    TaskDescription = dto.TaskDescription,
                    TaskStatusID = dto.TaskStatusID,
                    TaskPriorityID = dto.TaskPriorityID,
                    AssignedScore = dto.AssignedScore,
                    EarnedScore = dto.EarnedScore,
                    ProgressPercentage = dto.ProgressPercentage,
                    TaskAssignedDate = dto.TaskAssignedDate,
                    TaskStartDate = dto.TaskStartDate,
                    TaskDueDate = dto.TaskDueDate,
                    TaskCompletedDate = dto.TaskCompletedDate,
                    NextFollowUpDate = dto.NextFollowUpDate,
                    FacultyRemarks = dto.FacultyRemarks,
                    StudentRemarks = dto.StudentRemarks
                };

                _context.Task.Add(task);
                await _context.SaveChangesAsync();

                // Fetch related details for response
                var dbTask = await _context.Task
                    .Include(t => t.ProjectAllocation)
                        .ThenInclude(pa => pa.ProjectMaster)
                    .Include(t => t.ProjectAllocation)
                        .ThenInclude(pa => pa.Student)
                    .Include(t => t.TaskStatus)
                    .Include(t => t.TaskPriority)
                    .FirstOrDefaultAsync(t => t.TaskID == task.TaskID);

                var result = new TaskReadDTO
                {
                    TaskID = task.TaskID,
                    ProjectAllocationID = task.ProjectAllocationID,
                    ProjectTitle = dbTask?.ProjectAllocation?.ProjectMaster?.ProjectTitle,
                    StudentName = dbTask?.ProjectAllocation?.Student?.FullName,
                    TaskTitle = task.TaskTitle,
                    TaskDescription = task.TaskDescription,
                    TaskStatusID = task.TaskStatusID,
                    TaskStatusName = dbTask?.TaskStatus?.TaskStatusName,
                    TaskPriorityID = task.TaskPriorityID,
                    TaskPriorityName = dbTask?.TaskPriority?.TaskPriorityName,
                    AssignedScore = task.AssignedScore,
                    EarnedScore = task.EarnedScore,
                    ProgressPercentage = task.ProgressPercentage,
                    TaskAssignedDate = task.TaskAssignedDate,
                    TaskStartDate = task.TaskStartDate,
                    TaskDueDate = task.TaskDueDate,
                    TaskCompletedDate = task.TaskCompletedDate,
                    NextFollowUpDate = task.NextFollowUpDate,
                    FacultyRemarks = task.FacultyRemarks,
                    StudentRemarks = task.StudentRemarks
                };

                return Ok(new APIResponse<TaskReadDTO>
                {
                    Success = true,
                    Message = "Task Added Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<TaskReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while adding task",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, TaskUpdateDTO dto)
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
                var existingTask = await _context.Task.FindAsync(id);

                if (existingTask == null)
                {
                    return NotFound(new APIResponse<TaskReadDTO>
                    {
                        Success = false,
                        Message = "Task not found"
                    });
                }

                existingTask.ProjectAllocationID = dto.ProjectAllocationID;
                existingTask.TaskTitle = dto.TaskTitle;
                existingTask.TaskDescription = dto.TaskDescription;
                existingTask.TaskStatusID = dto.TaskStatusID;
                existingTask.TaskPriorityID = dto.TaskPriorityID;
                existingTask.AssignedScore = dto.AssignedScore;
                existingTask.EarnedScore = dto.EarnedScore;
                existingTask.ProgressPercentage = dto.ProgressPercentage;
                existingTask.TaskStartDate = dto.TaskStartDate;
                existingTask.TaskDueDate = dto.TaskDueDate;
                existingTask.TaskCompletedDate = dto.TaskCompletedDate;
                existingTask.NextFollowUpDate = dto.NextFollowUpDate;
                existingTask.FacultyRemarks = dto.FacultyRemarks;
                existingTask.StudentRemarks = dto.StudentRemarks;

                await _context.SaveChangesAsync();

                var dbTask = await _context.Task
                    .Include(t => t.ProjectAllocation)
                        .ThenInclude(pa => pa.ProjectMaster)
                    .Include(t => t.ProjectAllocation)
                        .ThenInclude(pa => pa.Student)
                    .Include(t => t.TaskStatus)
                    .Include(t => t.TaskPriority)
                    .FirstOrDefaultAsync(t => t.TaskID == existingTask.TaskID);

                var result = new TaskReadDTO
                {
                    TaskID = existingTask.TaskID,
                    ProjectAllocationID = existingTask.ProjectAllocationID,
                    ProjectTitle = dbTask?.ProjectAllocation?.ProjectMaster?.ProjectTitle,
                    StudentName = dbTask?.ProjectAllocation?.Student?.FullName,
                    TaskTitle = existingTask.TaskTitle,
                    TaskDescription = existingTask.TaskDescription,
                    TaskStatusID = existingTask.TaskStatusID,
                    TaskStatusName = dbTask?.TaskStatus?.TaskStatusName,
                    TaskPriorityID = existingTask.TaskPriorityID,
                    TaskPriorityName = dbTask?.TaskPriority?.TaskPriorityName,
                    AssignedScore = existingTask.AssignedScore,
                    EarnedScore = existingTask.EarnedScore,
                    ProgressPercentage = existingTask.ProgressPercentage,
                    TaskAssignedDate = existingTask.TaskAssignedDate,
                    TaskStartDate = existingTask.TaskStartDate,
                    TaskDueDate = existingTask.TaskDueDate,
                    TaskCompletedDate = existingTask.TaskCompletedDate,
                    NextFollowUpDate = existingTask.NextFollowUpDate,
                    FacultyRemarks = existingTask.FacultyRemarks,
                    StudentRemarks = existingTask.StudentRemarks
                };

                return Ok(new APIResponse<TaskReadDTO>
                {
                    Success = true,
                    Message = "Task Updated Successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<TaskReadDTO>
                {
                    Success = false,
                    Message = "Error occurred while updating task",
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
                var task = await _context.Task.FindAsync(id);
                if (task == null)
                {
                    return NotFound(new APIResponse<object>
                    {
                        Success = false,
                        Message = "Task not found"
                    });
                }

                _context.Task.Remove(task);
                await _context.SaveChangesAsync();

                return Ok(new APIResponse<object>
                {
                    Success = true,
                    Message = "Task deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIResponse<object>
                {
                    Success = false,
                    Message = "Error occurred while deleting task",
                    Errors = new List<string> { ex.Message }
                });
            }
        }
    }
}