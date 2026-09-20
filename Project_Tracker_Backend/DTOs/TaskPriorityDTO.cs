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
        public string TaskPriorityName { get; set; }

        public string TaskPriorityCssClass { get; set; }
    }

    public class TaskPriorityUpdateDTO
    {
        public string TaskPriorityName { get; set; }

        public string TaskPriorityCssClass { get; set; }
    }
}
