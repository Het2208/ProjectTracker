using System.ComponentModel.DataAnnotations;

namespace Project_Tracker_Backend.DTOs
{
    public class TaskStatusReadDTO
    {
        public int TaskStatusID { get; set; }
        public string TaskStatusName { get; set; }
        public string TaskStatusCssClass { get; set; }
    }

    public class TaskStatusCreateDTO
    {
        [Required, StringLength(20)]
        public string TaskStatusName { get; set; }

        [Required, StringLength(100)]
        public string TaskStatusCssClass { get; set; }
    }

    public class TaskStatusUpdateDTO
    {
        [Required, StringLength(20)]
        public string TaskStatusName { get; set; }

        [Required, StringLength(100)]
        public string TaskStatusCssClass { get; set; }
    }
}
