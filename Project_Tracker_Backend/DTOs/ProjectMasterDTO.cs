using System.ComponentModel.DataAnnotations;

namespace Project_Tracker_Backend.DTOs
{
    public class ProjectMasterReadDTO
    {
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; }
        public string? Description { get; set; }
    }

    public class ProjectMasterCreateDTO
    {
        public string ProjectTitle { get; set; }

        public string? Description { get; set; }
    }

    public class ProjectMasterUpdateDTO
    {
        public string ProjectTitle { get; set; }

        public string? Description { get; set; }
    }
}
