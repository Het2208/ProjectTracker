using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.Models;
using Task = Project_Tracker_Backend.Models.Task;

namespace Project_Tracker_Backend.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // Count APIs for all models
        [HttpGet]
        public async Task<IActionResult> GetRoleCount()
        {
            var count = await _context.Role.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserTypeCount()
        {
            var count = await _context.UserType.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserCount()
        {
            var count = await _context.Users.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserRoleCount()
        {
            var count = await _context.UserRole.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetTaskStatusCount()
        {
            var count = await _context.TaskStatus.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetTaskPriorityCount()
        {
            var count = await _context.TaskPriority.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetProjectMasterCount()
        {
            var count = await _context.ProjectMaster.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetProjectAllocationCount()
        {
            var count = await _context.ProjectAllocation.CountAsync();
            return Ok(count);
        }

        [HttpGet]
        public async Task<IActionResult> GetTaskCount()
        {
            var count = await _context.Task.CountAsync();
            return Ok(count);
        }


        // 1) Display the total number of students registered in the system.
        [HttpGet]
        public async Task<IActionResult> GetTotalStudents()
        {
            var totalStudents = await _context.Users
                .CountAsync(x => x.UserType.UserTypeName == "Student");
            return Ok(totalStudents);
        }

        // 2) Display the total number of faculty members guiding projects.
        [HttpGet]
        public async Task<IActionResult> GetTotalFaculty()
        {
            var totalFaculty = await _context.Users
                .CountAsync(x => x.UserType.UserTypeName == "Faculty");
            return Ok(totalFaculty);
        }

        // 3) Display the total number of projects available in the system.
        [HttpGet]
        public async Task<IActionResult> GetTotalProjects()
        {
            var totalProjects = await _context.ProjectMaster.CountAsync();
            return Ok(totalProjects);
        }

        // 4) Show how many tasks belong to each status category.
        [HttpGet]
        public async Task<IActionResult> GetTaskStatusSummary()
        {
            var taskStatusSummary = await _context.Task
                .GroupBy(t => t.TaskStatus.TaskStatusName)
                .Select(g => new
                {
                    TaskStatus = g.Key,
                    TotalTasks = g.Count()
                })
                .ToListAsync();
            return Ok(taskStatusSummary);
        }

        // 5) Show priority wise task count
        [HttpGet]
        public async Task<IActionResult> GetPrioritySummary()
        {
            var prioritySummary = await _context.Task
                .GroupBy(t => t.TaskPriority.TaskPriorityName)
                .Select(g => new
                {
                    Priority = g.Key,
                    TotalTasks = g.Count()
                })
                .ToListAsync();
            return Ok(prioritySummary);
        }

        // 6) Show how many projects are assigned to each faculty member.
        [HttpGet]
        public async Task<IActionResult> GetFacultyWorkload()
        {
            var facultyWorkload = await _context.ProjectAllocation
                .GroupBy(p => p.Faculty.FullName)
                .Select(g => new
                {
                    FacultyName = g.Key,
                    TotalProjects = g.Count()
                })
                .OrderByDescending(x => x.TotalProjects)
                .ToListAsync();
            return Ok(facultyWorkload);
        }

        // 7) Show how many tasks have been assigned to each student.
        [HttpGet]
        public async Task<IActionResult> GetStudentTasks()
        {
            var studentTasks = await _context.Task
                .GroupBy(t => t.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    StudentName = g.Key,
                    TotalTasks = g.Count()
                })
                .OrderByDescending(x => x.TotalTasks)
                .ToListAsync();
            return Ok(studentTasks);
        }

        // 8) Display the top 10 students having the highest average earned score.
        [HttpGet]
        public async Task<IActionResult> GetTopStudents()
        {
            var topStudents = await _context.Task
                .Where(t => t.EarnedScore != null)
                .GroupBy(t => t.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    StudentName = g.Key,
                    AverageScore = g.Average(t => t.EarnedScore)
                })
                .OrderByDescending(x => x.AverageScore)
                .Take(10)
                .ToListAsync();
            return Ok(topStudents);
        }

        // 9) Display the bottom 10 students based on average earned score.
        [HttpGet]
        public async Task<IActionResult> GetBottomStudents()
        {
            var bottomStudents = await _context.Task
                .Where(t => t.EarnedScore != null)
                .GroupBy(t => t.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    StudentName = g.Key,
                    AverageScore = g.Average(t => t.EarnedScore)
                })
                .OrderBy(x => x.AverageScore)
                .Take(10)
                .ToListAsync();
            return Ok(bottomStudents);
        }

        // 10) Display all tasks whose due date has passed but are not completed.
        [HttpGet]
        public async Task<IActionResult> GetOverdueTasks()
        {
            var overdueTasks = await _context.Task
                .Where(t =>
                    t.TaskDueDate < DateTime.Now &&
                    t.TaskStatus.TaskStatusName != "Completed")
                .Select(t => new
                {
                    TaskID = t.TaskID,
                    TaskTitle = t.TaskTitle,
                    Student = t.ProjectAllocation.Student.FullName,
                    Faculty = t.ProjectAllocation.Faculty.FullName,
                    TaskDueDate = t.TaskDueDate,
                    DaysOverdue = t.TaskDueDate.HasValue ? EF.Functions.DateDiffDay(t.TaskDueDate.Value, DateTime.Now) : 0
                })
                .ToListAsync();
            return Ok(overdueTasks);
        }

        // 11) Display tasks having follow-up dates within the next 7 days.
        [HttpGet]
        public async Task<IActionResult> GetUpcomingFollowUps()
        {
            var upcomingFollowUps = await _context.Task
                .Where(t =>
                    t.NextFollowUpDate >= DateTime.Today &&
                    t.NextFollowUpDate <= DateTime.Today.AddDays(7))
                .Select(t => new
                {
                    TaskTitle = t.TaskTitle,
                    Student = t.ProjectAllocation.Student.FullName,
                    Faculty = t.ProjectAllocation.Faculty.FullName,
                    NextFollowUpDate = t.NextFollowUpDate
                })
                .ToListAsync();
            return Ok(upcomingFollowUps);
        }

        // 12) Show how many students have obtained each grade.
        [HttpGet]
        public async Task<IActionResult> GetGradeDistribution()
        {
            var gradeDistribution = await _context.ProjectAllocation
                .GroupBy(p => p.OverAllGrade)
                .Select(g => new
                {
                    Grade = g.Key,
                    Students = g.Count()
                })
                .OrderBy(x => x.Grade)
                .ToListAsync();
            return Ok(gradeDistribution);
        }

        // 13) Show month-wise completed task count.
        [HttpGet]
        public async Task<IActionResult> GetMonthlyCompletion()
        {
            var monthlyCompletion = await _context.Task
                .Where(t => t.TaskCompletedDate != null)
                .GroupBy(t => new
                {
                    Year = t.TaskCompletedDate.Value.Year,
                    Month = t.TaskCompletedDate.Value.Month
                })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalCompletedTasks = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();
            return Ok(monthlyCompletion);
        }

        // 14) Display Role Wise Active User Count.
        [HttpGet]
        public async Task<IActionResult> GetRoleWiseActiveUserCount()
        {
            var result = await _context.UserRole
                .Where(x => x.User.IsActive)
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    ActiveUsers = g.Count()
                })
                .OrderByDescending(x => x.ActiveUsers)
                .ToListAsync();
            return Ok(result);
        }

        // 15) Display each role with users assigned to it.
        [HttpGet]
        public async Task<IActionResult> GetUsersByRole()
        {
            var result = await _context.UserRole
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    Users = g.Select(x => x.User.FullName).ToList()
                })
                .ToListAsync();
            return Ok(result);
        }

        // 16) List Roles Having More Than 10 Users.
        [HttpGet]
        public async Task<IActionResult> GetRolesWithMoreThanTenUsers()
        {
            var result = await _context.UserRole
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    TotalUsers = g.Count()
                })
                .Where(x => x.TotalUsers > 10)
                .ToListAsync();
            return Ok(result);
        }

        // 17) Display role statistics.
        [HttpGet]
        public async Task<IActionResult> GetRoleStatistics()
        {
            var result = await _context.UserRole
                .GroupBy(x => x.Role.RoleName)
                .Select(g => new
                {
                    RoleName = g.Key,
                    TotalUsers = g.Count(),
                    ActiveUsers = g.Count(x => x.User.IsActive),
                    InactiveUsers = g.Count(x => !x.User.IsActive)
                })
                .OrderByDescending(x => x.TotalUsers)
                .ToListAsync();
            return Ok(result);
        }

        // 18) Show tasks due within next 7 days.
        [HttpGet]
        public async Task<IActionResult> GetUpcomingDueTasks()
        {
            var result = await _context.Task
                .Where(x =>
                    x.TaskDueDate >= DateTime.Today &&
                    x.TaskDueDate <= DateTime.Today.AddDays(7))
                .Select(x => new
                {
                    TaskID = x.TaskID,
                    TaskTitle = x.TaskTitle,
                    Project = x.ProjectAllocation.ProjectMaster.ProjectTitle,
                    Student = x.ProjectAllocation.Student.FullName,
                    TaskDueDate = x.TaskDueDate,
                    RemainingDays = EF.Functions.DateDiffDay(DateTime.Today, x.TaskDueDate)
                })
                .OrderBy(x => x.TaskDueDate)
                .ToListAsync();
            return Ok(result);
        }

        // 19) Display each project with total tasks, completed tasks, pending tasks, and average task progress.
        [HttpGet]
        public async Task<IActionResult> GetProjectTaskSummary()
        {
            var result = await _context.Task
                .GroupBy(x => x.ProjectAllocation.ProjectMaster.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(x => x.TaskStatus.TaskStatusName == "Completed"),
                    PendingTasks = g.Count(x => x.TaskStatus.TaskStatusName == "Pending"),
                    AverageProgress = g.Average(x => x.ProgressPercentage)
                })
                .ToListAsync();
            return Ok(result);
        }

        // 20) Display project-wise total assigned score, earned score, and score percentage.
        [HttpGet]
        public async Task<IActionResult> GetProjectScoreSummary()
        {
            var result = await _context.Task
                .GroupBy(x => x.ProjectAllocation.ProjectMaster.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,
                    TotalAssignedScore = g.Sum(x => x.AssignedScore),
                    TotalEarnedScore = g.Sum(x => x.EarnedScore ?? 0),
                    ScorePercentage = g.Sum(x => x.AssignedScore) > 0 
                        ? (g.Sum(x => x.EarnedScore ?? 0) / g.Sum(x => x.AssignedScore)) * 100 
                        : 0
                })
                .ToListAsync();
            return Ok(result);
        }

        // 21) Display Top 10 projects based on average earned score.
        [HttpGet]
        public async Task<IActionResult> GetTopProjectsByScore()
        {
            var result = await _context.Task
                .Where(x => x.EarnedScore != null)
                .GroupBy(x => x.ProjectAllocation.ProjectMaster.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,
                    AverageScore = g.Average(x => x.EarnedScore)
                })
                .OrderByDescending(x => x.AverageScore)
                .Take(10)
                .ToListAsync();
            return Ok(result);
        }

        // 22) Show project count, task count, and average progress for each faculty.
        [HttpGet]
        public async Task<IActionResult> GetFacultyStatistics()
        {
            var result = await _context.ProjectAllocation
                .GroupBy(x => x.Faculty.FullName)
                .Select(g => new
                {
                    Faculty = g.Key,
                    TotalProjects = g.Count(),
                    TotalTasks = g.Sum(x => x.TotalTasksGiven),
                    AverageProgress = g.Average(x => x.ProgressPercentage)
                })
                .ToListAsync();
            return Ok(result);
        }

        // 23) Display task completion statistics and average score for each student.
        [HttpGet]
        public async Task<IActionResult> GetStudentTaskStatistics()
        {
            var result = await _context.Task
                .GroupBy(x => x.ProjectAllocation.Student.FullName)
                .Select(g => new
                {
                    Student = g.Key,
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(x => x.TaskStatus.TaskStatusName == "Completed"),
                    PendingTasks = g.Count(x => x.TaskStatus.TaskStatusName == "Pending"),
                    AverageScore = g.Average(x => x.EarnedScore)
                })
                .ToListAsync();
            return Ok(result);
        }

        // 24) Display projects whose expected completion date has passed but are still incomplete.
        [HttpGet]
        public async Task<IActionResult> GetOverdueProjects()
        {
            var result = await _context.ProjectAllocation
                .Where(x =>
                    x.ProjectEndDate < DateTime.Now &&
                    x.ProgressPercentage < 100)
                .Select(x => new
                {
                    ProjectTitle = x.ProjectMaster.ProjectTitle,
                    Student = x.Student.FullName,
                    Faculty = x.Faculty.FullName,
                    ProjectEndDate = x.ProjectEndDate,
                    ProgressPercentage = x.ProgressPercentage
                })
                .ToListAsync();
            return Ok(result);
        }

        // 25) Show month-wise completed task count (alternative projection).
        [HttpGet]
        public async Task<IActionResult> GetMonthlyCompletedTaskCount()
        {
            var result = await _context.Task
                .Where(x => x.TaskCompletedDate != null)
                .GroupBy(x => new
                {
                    Year = x.TaskCompletedDate.Value.Year,
                    Month = x.TaskCompletedDate.Value.Month
                })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    CompletedTasks = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();
            return Ok(result);
        }

        // 26) Rank faculties based on average project progress.
        [HttpGet]
        public async Task<IActionResult> GetFacultyRankingsByProgress()
        {
            var result = await _context.ProjectAllocation
                .GroupBy(x => x.Faculty.FullName)
                .Select(g => new
                {
                    Faculty = g.Key,
                    AverageProgress = g.Average(x => x.ProgressPercentage)
                })
                .OrderByDescending(x => x.AverageProgress)
                .ToListAsync();
            return Ok(result);
        }

        // 27) Display task statistics for every project.
        [HttpGet]
        public async Task<IActionResult> GetProjectTaskStatistics()
        {
            var result = await _context.Task
                .GroupBy(x => x.ProjectAllocation.ProjectMaster.ProjectTitle)
                .Select(g => new
                {
                    Project = g.Key,
                    TotalTasks = g.Count(),
                    CompletedTasks = g.Count(x => x.TaskStatus.TaskStatusName == "Completed"),
                    PendingTasks = g.Count(x => x.TaskStatus.TaskStatusName == "Pending"),
                    OverdueTasks = g.Count(x =>
                        x.TaskDueDate < DateTime.Now &&
                        x.TaskStatus.TaskStatusName != "Completed")
                })
                .ToListAsync();
            return Ok(result);
        }
    }
}
