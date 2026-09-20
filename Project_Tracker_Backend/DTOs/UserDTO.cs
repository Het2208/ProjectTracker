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
        public string? ProfilePicturePath { get; set; }
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserCreateDTO
    {
        public int UserTypeId { get; set; }
        public string FullName { get; set; }
        public string? UserCode { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string MobileNumber { get; set; }
        public IFormFile? ProfilePicturePath { get; set; }
        public bool IsActive { get; set; }
    }

    public class UserUpdateDTO
    {
        public int UserId { get; set; }
        public int UserTypeId { get; set; }
        public string FullName { get; set; }
        public string? UserCode { get; set; }
        public string Email { get; set; }
        public string? Password { get; set; }
        public string MobileNumber { get; set; }
        public IFormFile? ProfilePicturePath { get; set; }
        public bool IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class UserLoginDTO
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
