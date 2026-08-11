using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_Tracker_Backend.Models
{
    public class Task
    {
        [Key]
        public int TaskID { get; set; } 

        public ProjectAllocation? ProjectAllocation { get; set; }
        
        [Required]
        [ForeignKey("ProjectAllocation")]
        public int ProjectAllocationID { get; set; } 

        [Required, MaxLength(200)]
        public string TaskTitle { get; set; } = string.Empty; 

        public string? TaskDescription { get; set; } 

        public TaskStatus? TaskStatus { get; set; } 

        [Required]
        [ForeignKey("TaskStatus")]
        public int TaskStatusID { get; set; } 

        public TaskPriority? TaskPriority { get; set; }

        [Required]
        [ForeignKey("TaskPriority")]
        public int TaskPriorityID { get; set; } 

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal AssignedScore { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? EarnedScore { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal ProgressPercentage { get; set; }

        [Required]
        public DateTime TaskAssignedDate { get; set; }

        public DateTime? TaskStartDate { get; set; }

        public DateTime? TaskDueDate { get; set; }

        public DateTime? TaskCompletedDate { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        [MaxLength(500)]
        public string? FacultyRemarks { get; set; }

        [MaxLength(500)]
        public string? StudentRemarks { get; set; }

    }
}
