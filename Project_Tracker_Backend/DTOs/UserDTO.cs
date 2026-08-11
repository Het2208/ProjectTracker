using System.ComponentModel.DataAnnotations;

namespace Project_Tracker_Backend.DTOs
{
    public class UserReadDTO
    {
        public int UserId { get; set; }
        public int UserTypeId { get; set; }
        public string? UserTypeName { get; set; }
        public string FullName { get; set; }
        public string? UserCode { get; set; }
        public string Email { get; set; }
        public string MobileNumber { get; set; }
        public string ProfilePicturePath { get; set; }
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserCreateDTO
    {
        [Required]
        public int UserTypeId { get; set; }

        [Required, StringLength(150)]
        public string FullName { get; set; }

        [StringLength(100)]
        public string? UserCode { get; set; }

        [Required, EmailAddress, StringLength(150)]
        public string Email { get; set; }

        [Required, StringLength(255)]
        public string Password { get; set; }

        [Required, StringLength(15)]
        public string MobileNumber { get; set; }

        [Required, StringLength(500)]
        public string ProfilePicturePath { get; set; }

        [Required]
        public bool IsActive { get; set; }
    }

    public class UserUpdateDTO
    {
        [Required]
        public int UserTypeId { get; set; }

        [Required, StringLength(150)]
        public string FullName { get; set; }

        [StringLength(100)]
        public string? UserCode { get; set; }

        [Required, EmailAddress, StringLength(150)]
        public string Email { get; set; }

        [StringLength(255)]
        public string? Password { get; set; } // Nullable in update to allow leaving unchanged

        [Required, StringLength(15)]
        public string MobileNumber { get; set; }

        [Required, StringLength(500)]
        public string ProfilePicturePath { get; set; }

        [Required]
        public bool IsActive { get; set; }

        public bool? IsDeleted { get; set; }
    }
}
