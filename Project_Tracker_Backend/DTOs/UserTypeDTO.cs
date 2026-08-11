namespace Project_Tracker_Backend.DTOs
{
    public class UserTypeReadDTO
    {
        public int UserTypeID { get; set; }
        public string UserTypeName { get; set; }
        public string Description { get; set; }
    }

    public class UserTypeCreateDTO
    {
        public string UserTypeName { get; set; }
        public string Description { get; set; }
    }

    public class UserTypeUpdateDTO
    {
        public string UserTypeName { get; set; }
        public string Description { get; set; }
    }
}
