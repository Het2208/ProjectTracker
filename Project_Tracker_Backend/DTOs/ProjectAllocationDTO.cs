using System;
using System.ComponentModel.DataAnnotations;

namespace Project_Tracker_Backend.DTOs
{
    public class ProjectAllocationReadDTO
    {
        public int ProjectAllocationID { get; set; }
        public int ProjectID { get; set; }
        public string? ProjectTitle { get; set; }
        public int StudentID { get; set; }
        public string? StudentName { get; set; }
        public int FacultyID { get; set; }
        public string? FacultyName { get; set; }
        public DateTime AssignedDate { get; set; }
        public DateTime ProjectStartDate { get; set; }
        public DateTime ProjectEndDate { get; set; }
        public int TotalTasksGiven { get; set; }
        public int TotalCompletedTasks { get; set; }
        public decimal ProgressPercentage { get; set; }
        public string? OverAllGrade { get; set; }
    }

    public class ProjectAllocationCreateDTO
    {
        [Required]
        public int ProjectID { get; set; }

        [Required]
        public int StudentID { get; set; }

        [Required]
        public int FacultyID { get; set; }

        public DateTime AssignedDate { get; set; } = DateTime.Now;

        [Required]
        public DateTime ProjectStartDate { get; set; }

        [Required]
        public DateTime ProjectEndDate { get; set; }

        public int TotalTasksGiven { get; set; } = 0;
        public int TotalCompletedTasks { get; set; } = 0;
        public decimal ProgressPercentage { get; set; } = 0;

        [StringLength(1)]
        [RegularExpression("^[ABC]?$", ErrorMessage = "Grade must be A, B, or C.")]
        public string? OverAllGrade { get; set; }
    }

    public class ProjectAllocationUpdateDTO
    {
        [Required]
        public int ProjectID { get; set; }

        [Required]
        public int StudentID { get; set; }

        [Required]
        public int FacultyID { get; set; }

        [Required]
        public DateTime ProjectStartDate { get; set; }

        [Required]
        public DateTime ProjectEndDate { get; set; }

        public int TotalTasksGiven { get; set; }
        public int TotalCompletedTasks { get; set; }
        public decimal ProgressPercentage { get; set; }

        [StringLength(1)]
        [RegularExpression("^[ABC]?$", ErrorMessage = "Grade must be A, B, or C.")]
        public string? OverAllGrade { get; set; }
    }
}
