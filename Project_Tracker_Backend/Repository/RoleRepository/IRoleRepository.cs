using Project_Tracker_Backend.Models;
using SystemTask = System.Threading.Tasks.Task;

namespace Project_Tracker_Backend.Repository.RoleRepository
{
    public interface IRoleRepository
    {
        Task<List<Role>> GetAllAsync();
        Task<Role?> GetByIdAsync(int id);
        SystemTask AddAsync(Role role);
        SystemTask UpdateAsync(Role role);
        SystemTask DeleteAsync(Role role);
    }
}
