using System;
using System.ComponentModel.DataAnnotations;

namespace Project_Tracker_Backend.DTOs
{
    public class TaskReadDTO
    {
        public int TaskID { get; set; }
        public int ProjectAllocationID { get; set; }
        public string? ProjectTitle { get; set; }
        public string? StudentName { get; set; }
        public string TaskTitle { get; set; }
        public string? TaskDescription { get; set; }
        public int TaskStatusID { get; set; }
        public string? TaskStatusName { get; set; }
        public int TaskPriorityID { get; set; }
        public string? TaskPriorityName { get; set; }
        public decimal AssignedScore { get; set; }
        public decimal? EarnedScore { get; set; }
        public decimal ProgressPercentage { get; set; }
        public DateTime TaskAssignedDate { get; set; }
        public DateTime? TaskStartDate { get; set; }
        public DateTime? TaskDueDate { get; set; }
        public DateTime? TaskCompletedDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }
        public string? FacultyRemarks { get; set; }
        public string? StudentRemarks { get; set; }
    }

    public class TaskCreateDTO
    {
        [Required]
        public int ProjectAllocationID { get; set; }

        [Required, StringLength(200)]
        public string TaskTitle { get; set; }

        public string? TaskDescription { get; set; }

        [Required]
        public int TaskStatusID { get; set; }

        [Required]
        public int TaskPriorityID { get; set; }

        [Required]
        public decimal AssignedScore { get; set; }

        public decimal? EarnedScore { get; set; }

        [Required]
        public decimal ProgressPercentage { get; set; }

        [Required]
        public DateTime TaskAssignedDate { get; set; } = DateTime.Now;

        public DateTime? TaskStartDate { get; set; }
        public DateTime? TaskDueDate { get; set; }
        public DateTime? TaskCompletedDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }

        [StringLength(500)]
        public string? FacultyRemarks { get; set; }

        [StringLength(500)]
        public string? StudentRemarks { get; set; }
    }

    public class TaskUpdateDTO
    {
        [Required]
        public int ProjectAllocationID { get; set; }

        [Required, StringLength(200)]
        public string TaskTitle { get; set; }

        public string? TaskDescription { get; set; }

        [Required]
        public int TaskStatusID { get; set; }

        [Required]
        public int TaskPriorityID { get; set; }

        [Required]
        public decimal AssignedScore { get; set; }

        public decimal? EarnedScore { get; set; }

        [Required]
        public decimal ProgressPercentage { get; set; }

        [Required]
        public DateTime TaskAssignedDate { get; set; }

        public DateTime? TaskStartDate { get; set; }
        public DateTime? TaskDueDate { get; set; }
        public DateTime? TaskCompletedDate { get; set; }
        public DateTime? NextFollowUpDate { get; set; }

        [StringLength(500)]
        public string? FacultyRemarks { get; set; }

        [StringLength(500)]
        public string? StudentRemarks { get; set; }
    }
}
