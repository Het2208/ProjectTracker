namespace Project_Tracker_Backend.DTOs
{
    public class UserReadDTO
    {
        public int UserId { get; set; }
        public int UserTypeId { get; set; }
        public string? UserTypeName { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? UserCode { get; set; }
        public string Email { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string? ProfilePicturePath { get; set; }
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserCreateDTO
    {
        public int UserTypeId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? UserCode { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public IFormFile? ProfilePicturePath { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UserUpdateDTO
    {
        public int UserId { get; set; }
        public int UserTypeId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? UserCode { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
        public IFormFile? ProfilePicturePath { get; set; }
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserLoginDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UserRegisterDTO
    {
        public string Role { get; set; } = "Student"; // "Student" or "Faculty"
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public IFormFile? ProfilePicture { get; set; }

        // Student-specific fields
        public string? EnrollmentNumber { get; set; }
        public string? Department { get; set; }
        public string? Semester { get; set; }
        public string? Division { get; set; }
        public string? Batch { get; set; }

        // Faculty-specific fields
        public string? FacultyId { get; set; }
        public string? Designation { get; set; }
        public string? AreaOfExpertise { get; set; }
    }

    public class AuthResponseDTO
    {
        public string Token { get; set; } = string.Empty;
        public UserReadDTO User { get; set; } = null!;
    }
}
