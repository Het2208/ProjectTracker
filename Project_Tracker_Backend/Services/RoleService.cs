using Project_Tracker_Backend.DTOs;
using Project_Tracker_Backend.Models;
using Project_Tracker_Backend.Repository.RoleRepository;

namespace Project_Tracker_Backend.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<List<RoleReadDTO>> GetAllAsync()
        {
            var roles = await _roleRepository.GetAllAsync();
            return roles.Select(ToReadDto).ToList();
        }

        public async Task<RoleReadDTO?> GetByIdAsync(int id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            return role is null ? null : ToReadDto(role);
        }

        public async Task<RoleReadDTO> AddAsync(RoleCreateDTO dto)
        {
            var role = new Role { RoleName = dto.RoleName, Description = dto.Description };
            await _roleRepository.AddAsync(role);
            return ToReadDto(role);
        }

        public async Task<RoleReadDTO?> UpdateAsync(int id, RoleUpdateDTO dto)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            if (role is null) return null;

            role.RoleName = dto.RoleName;
            role.Description = dto.Description;
            await _roleRepository.UpdateAsync(role);
            return ToReadDto(role);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var role = await _roleRepository.GetByIdAsync(id);
            if (role is null) return false;

            await _roleRepository.DeleteAsync(role);
            return true;
        }

        private static RoleReadDTO ToReadDto(Role role) => new()
        {
            RoleId = role.RoleId,
            RoleName = role.RoleName,
            Description = role.Description
        };
    }
}
