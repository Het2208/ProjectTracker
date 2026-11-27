using Microsoft.AspNetCore.Identity;

namespace Project_Tracker_Backend.Services
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string hashedPasswordOrPlain, string providedPassword, out bool rehashNeeded);
    }

    public class PasswordService : IPasswordService
    {
        private readonly PasswordHasher<object> _hasher = new();
        private readonly object _dummyUser = new();

        public string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Password cannot be null or empty.", nameof(password));
            }
            return _hasher.HashPassword(_dummyUser, password);
        }

        public bool VerifyPassword(string hashedPasswordOrPlain, string providedPassword, out bool rehashNeeded)
        {
            rehashNeeded = false;
            if (string.IsNullOrEmpty(hashedPasswordOrPlain) || string.IsNullOrEmpty(providedPassword))
            {
                return false;
            }

            // ASP.NET Core Identity hashes start with standard byte format marker (base64 string starting with AQAAAA or similar)
            // If it can be verified with PasswordHasher, do so:
            try
            {
                var result = _hasher.VerifyHashedPassword(_dummyUser, hashedPasswordOrPlain, providedPassword);
                if (result == PasswordVerificationResult.Success)
                {
                    return true;
                }
                if (result == PasswordVerificationResult.SuccessRehashNeeded)
                {
                    rehashNeeded = true;
                    return true;
                }
            }
            catch
            {
                // Not a valid hash format, fall back to plain-text check for existing accounts
            }

            // Plain text check for existing legacy users
            if (string.Equals(hashedPasswordOrPlain, providedPassword, StringComparison.Ordinal))
            {
                rehashNeeded = true;
                return true;
            }

            return false;
        }
    }
}
