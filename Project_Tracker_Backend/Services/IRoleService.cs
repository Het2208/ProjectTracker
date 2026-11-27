using Project_Tracker_Backend.DTOs;

namespace Project_Tracker_Backend.Services
{
    public interface IRoleService
    {
        Task<List<RoleReadDTO>> GetAllAsync();
        Task<RoleReadDTO?> GetByIdAsync(int id);
        Task<RoleReadDTO> AddAsync(RoleCreateDTO dto);
        Task<RoleReadDTO?> UpdateAsync(int id, RoleUpdateDTO dto);
        Task<bool> DeleteAsync(int id);
    }
}
