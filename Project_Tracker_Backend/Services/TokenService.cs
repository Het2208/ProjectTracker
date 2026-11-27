using Microsoft.IdentityModel.Tokens;
using Project_Tracker_Backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Project_Tracker_Backend.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)
        {
            var roleName = user.UserType?.UserTypeName ?? "Student";
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Email),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new(ClaimTypes.Name, user.FullName ?? string.Empty),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Role, roleName),
                new("role", roleName),
                new("userId", user.UserId.ToString()),
                new("fullName", user.FullName ?? string.Empty),
                new("userTypeId", user.UserTypeId.ToString())
            };

            var keyString = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("Jwt:Key is not configured.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var issuer = _config["Jwt:Issuer"] ?? "ProjectTracker";
            var audience = _config["Jwt:Audience"] ?? "ProjectTrackerClient";
            var expiryMinutes = 60.0;
            if (double.TryParse(_config["Jwt:ExpiresInMinutes"], out var parsedMinutes) && parsedMinutes > 0)
            {
                expiryMinutes = parsedMinutes;
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
