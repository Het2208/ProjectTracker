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
        public string TaskStatusName { get; set; }

        public string TaskStatusCssClass { get; set; }
    }

    public class TaskStatusUpdateDTO
    {
        public string TaskStatusName { get; set; }

        public string TaskStatusCssClass { get; set; }
    }
}
