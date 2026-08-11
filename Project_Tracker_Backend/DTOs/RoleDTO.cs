namespace Project_Tracker_Backend.DTOs
{
    public class RoleReadDTO
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public string? Description { get; set; }
    }

    public class RoleCreateDTO
    {
        public string RoleName { get; set; }
        public string? Description { get; set; }
    }

    public class RoleUpdateDTO
    {
        public string RoleName { get; set; }
        public string? Description { get; set; }
    }

}