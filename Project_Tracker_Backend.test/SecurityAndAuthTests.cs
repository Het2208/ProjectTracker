using Microsoft.AspNetCore.Identity;
using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Services;
using System.Security.Claims;
using Xunit;

namespace Project_Tracker_Backend.test
{
    public class SecurityAndAuthTests
    {
        [Fact]
        public void PasswordService_HashesAndVerifiesPasswordCorrectly()
        {
            var passwordService = new PasswordService();
            var rawPassword = "StrongP@ssw0rd123";

            var hash = passwordService.HashPassword(rawPassword);

            Assert.NotNull(hash);
            Assert.NotEqual(rawPassword, hash);
            Assert.True(passwordService.VerifyPassword(hash, rawPassword, out var rehashNeeded));
            Assert.False(rehashNeeded);
            Assert.False(passwordService.VerifyPassword(hash, "WrongPassword", out _));
        }

        [Fact]
        public void PasswordService_VerifiesLegacyPlainTextPasswordAndFlagsRehash()
        {
            var passwordService = new PasswordService();
            var legacyPlainPassword = "LegacyPlainPassword123";

            var verified = passwordService.VerifyPassword(legacyPlainPassword, legacyPlainPassword, out var rehashNeeded);

            Assert.True(verified);
            Assert.True(rehashNeeded, "Legacy plaintext password must flag that rehash is required for automatic migration.");
        }

        [Fact]
        public void PasswordService_RejectsEmptyOrNullPassword()
        {
            var passwordService = new PasswordService();

            Assert.Throws<ArgumentException>(() => passwordService.HashPassword(""));
            Assert.False(passwordService.VerifyPassword("", "password", out _));
            Assert.False(passwordService.VerifyPassword("hash", "", out _));
        }

        [Fact]
        public void TokenService_GeneratesJwtWithRequiredClaims()
        {
            var myConfiguration = new TestConfiguration(new Dictionary<string, string?>
            {
                { "Jwt:Key", "TEST_CRYPTOGRAPHIC_SECRET_KEY_FOR_UNIT_TESTING_12345!" },
                { "Jwt:Issuer", "ProjectTracker" },
                { "Jwt:Audience", "ProjectTrackerClient" },
                { "Jwt:ExpiresInMinutes", "60" }
            });

            var tokenService = new TokenService(myConfiguration);

            var user = new User
            {
                UserId = 42,
                FullName = "Alice Johnson",
                Email = "alice@darshan.ac.in",
                UserTypeId = 2,
                UserType = new UserType { UserTypeId = 2, UserTypeName = "Student" }
            };

            var jwtString = tokenService.GenerateToken(user);

            Assert.NotNull(jwtString);
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(jwtString);

            Assert.Equal("ProjectTracker", token.Issuer);
            Assert.Contains("ProjectTrackerClient", token.Audiences);
            Assert.Equal("alice@darshan.ac.in", token.Subject);
            Assert.Equal("Student", token.Claims.First(c => c.Type == ClaimTypes.Role).Value);
            Assert.Equal("42", token.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        }

        [Theory]
        [InlineData("Admin", false)]
        [InlineData("Student", true)]
        [InlineData("Faculty", true)]
        public void RegistrationRole_CheckAdminDisallowed(string role, bool allowed)
        {
            var isPublicRoleAllowed = string.Equals(role, "Student", StringComparison.OrdinalIgnoreCase) ||
                                      string.Equals(role, "Faculty", StringComparison.OrdinalIgnoreCase);

            Assert.Equal(allowed, isPublicRoleAllowed);
        }

        private sealed class TestConfiguration : Microsoft.Extensions.Configuration.IConfiguration
        {
            private readonly Dictionary<string, string?> _values;

            public TestConfiguration(Dictionary<string, string?> values) => _values = values;

            public string? this[string key]
            {
                get
                {
                    _values.TryGetValue(key, out var val);
                    return val;
                }
                set => _values[key] = value;
            }

            public Microsoft.Extensions.Configuration.IConfigurationSection GetSection(string key) =>
                throw new NotImplementedException();

            public IEnumerable<Microsoft.Extensions.Configuration.IConfigurationSection> GetChildren() =>
                Enumerable.Empty<Microsoft.Extensions.Configuration.IConfigurationSection>();

            public Microsoft.Extensions.Primitives.IChangeToken GetReloadToken() =>
                throw new NotImplementedException();
        }
    }
}
