using System.ComponentModel.DataAnnotations;

namespace Project_Tracker_Backend.DTOs
{
    public class TaskPriorityReadDTO
    {
        public int TaskPriorityId { get; set; }
        public string TaskPriorityName { get; set; }
        public string TaskPriorityCssClass { get; set; }
    }

    public class TaskPriorityCreateDTO
    {
        [Required, StringLength(20)]
        public string TaskPriorityName { get; set; }

        [Required, StringLength(20)]
        public string TaskPriorityCssClass { get; set; }
    }

    public class TaskPriorityUpdateDTO
    {
        [Required, StringLength(20)]
        public string TaskPriorityName { get; set; }

        [Required, StringLength(20)]
        public string TaskPriorityCssClass { get; set; }
    }
}
