namespace Project_Tracker_Backend.Services
{
    public class FileService : IFileService
    {
        private readonly string _storageRoot;
        private const string FilesBaseFolder = "Files";
        private const long MaxFileSize = 10 * 1024 * 1024; // 10MB
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".zip"
        };

        public FileService(IWebHostEnvironment environment, IConfiguration configuration)
        {
            // Allow configurable persistent disk mount path (e.g. Render persistent disk: /var/data/files)
            var configuredStorage = configuration["FileStorage:BasePath"];
            if (!string.IsNullOrWhiteSpace(configuredStorage))
            {
                _storageRoot = configuredStorage;
            }
            else
            {
                _storageRoot = environment.WebRootPath
                    ?? Path.Combine(environment.ContentRootPath, "wwwroot");
            }

            if (!Directory.Exists(_storageRoot))
            {
                Directory.CreateDirectory(_storageRoot);
            }
        }

        public async Task<string> UploadFileAsync(IFormFile file, string subFolder, CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or missing.");
            }

            if (file.Length > MaxFileSize)
            {
                throw new InvalidOperationException($"File exceeds maximum allowed size of {MaxFileSize / (1024 * 1024)}MB.");
            }

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                throw new InvalidOperationException($"File type '{extension}' is not allowed.");
            }

            // Sanitize subFolder to prevent path traversal
            var safeSubFolder = Path.GetFileName(subFolder.Replace('\\', '/').Trim('/'));
            if (string.IsNullOrWhiteSpace(safeSubFolder))
            {
                safeSubFolder = "General";
            }

            string uploadFolderPath = Path.Combine(_storageRoot, FilesBaseFolder, safeSubFolder);
            if (!Directory.Exists(uploadFolderPath))
            {
                Directory.CreateDirectory(uploadFolderPath);
            }

            // Generate cryptographically unique safe file name
            string safeFileName = $"{Guid.NewGuid():N}{extension}";
            string fullPhysicalPath = Path.Combine(uploadFolderPath, safeFileName);

            using (var stream = new FileStream(fullPhysicalPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            return Path.Combine(FilesBaseFolder, safeSubFolder, safeFileName).Replace("\\", "/");
        }

        public void DeleteFile(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath)) return;

            // Prevent path traversal
            var sanitizedRelative = relativePath.Replace("..", "").TrimStart('/', '\\');
            string fullPath = Path.Combine(_storageRoot, sanitizedRelative);

            if (File.Exists(fullPath))
            {
                try
                {
                    File.Delete(fullPath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deleting file {fullPath}: {ex.Message}");
                }
            }
        }
    }
}
