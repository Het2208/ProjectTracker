using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Project_Tracker_Backend.Models
{
    public class TaskPriority
    {
        [Key]
        public int TaskPriorityId { get; set; }

        [Required, MaxLength(20)]
        public string TaskPriorityName { get; set; } = string.Empty;


        [Required, MaxLength(20)]
        public string TaskPriorityCssClass { get; set; } = string.Empty;
    }
}
