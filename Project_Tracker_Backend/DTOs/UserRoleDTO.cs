using System.ComponentModel.DataAnnotations;

namespace Project_Tracker_Backend.DTOs
{
    public class UserRoleReadDTO
    {
        public int RolePermissionId { get; set; }
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public int UserId { get; set; }
        public string? FullName { get; set; }
    }

    public class UserRoleCreateDTO
    {
        public int RoleId { get; set; }

        public int UserId { get; set; }
    }

    public class UserRoleUpdateDTO
    {
        public int RoleId { get; set; }

        public int UserId { get; set; }
    }
}
