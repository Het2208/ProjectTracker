namespace Project_Tracker_Backend.Services
{
    public interface IFileService
    {
        Task<string> UploadFileAsync(IFormFile file, string subFolder, CancellationToken cancellationToken = default);
        void DeleteFile(string? relativePath);
    }
}
