using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Repository.RoleRepository;
using Project_Tracker_Backend.Services;

namespace Project_Tracker_Backend.test;

public class RoleServiceTests
{
    [Theory]
    [InlineData("Reviewer", "Can review project submissions.")]
    [InlineData("Coordinator", "Can coordinate project work.")]
    public async System.Threading.Tasks.Task AddAsync_ValidRole_AddsRoleAndReturnsReadDto(
        string roleName,
        string description)
    {
        // Arrange
        var createDto = new RoleCreateDTO
        {
            RoleName = roleName,
            Description = description
        };
        var repository = new InMemoryRoleRepository();
        var service = new RoleService(repository);

        // Act
        var result = await service.AddAsync(createDto);

        // Assert
        Assert.Equal(1, result.RoleId);
        Assert.Equal(roleName, result.RoleName);
        Assert.Equal(description, result.Description);
        Assert.Single(repository.Roles);
        Assert.Equal(roleName, repository.Roles[0].RoleName);
    }

    private sealed class InMemoryRoleRepository : IRoleRepository
    {
        public List<Role> Roles { get; } = [];

        public System.Threading.Tasks.Task<List<Role>> GetAllAsync() =>
            System.Threading.Tasks.Task.FromResult(Roles.ToList());

        public System.Threading.Tasks.Task<Role?> GetByIdAsync(int id) =>
            System.Threading.Tasks.Task.FromResult(Roles.FirstOrDefault(role => role.RoleId == id));

        public System.Threading.Tasks.Task AddAsync(Role role)
        {
            role.RoleId = Roles.Count + 1;
            Roles.Add(role);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        public System.Threading.Tasks.Task UpdateAsync(Role role) =>
            System.Threading.Tasks.Task.CompletedTask;

        public System.Threading.Tasks.Task DeleteAsync(Role role)
        {
            Roles.Remove(role);
            return System.Threading.Tasks.Task.CompletedTask;
        }
    }
}
