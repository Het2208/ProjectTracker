using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.Models;
using Microsoft.EntityFrameworkCore;
using SystemTask = System.Threading.Tasks.Task;

namespace Project_Tracker_Backend.Repository.RoleRepository
{
    public class RoleRepository : IRoleRepository
    {
        private readonly AppDbContext _context;

        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }

        public Task<List<Role>> GetAllAsync() =>
            _context.Role.AsNoTracking().ToListAsync();

        public Task<Role?> GetByIdAsync(int id) =>
            _context.Role.FindAsync(id).AsTask();

        public async SystemTask AddAsync(Role role)
        {
            await _context.Role.AddAsync(role);
            await _context.SaveChangesAsync();
        }

        public async SystemTask UpdateAsync(Role role)
        {
            _context.Role.Update(role);
            await _context.SaveChangesAsync();
        }

        public async SystemTask DeleteAsync(Role role)
        {
            _context.Role.Remove(role);
            await _context.SaveChangesAsync();
        }
    }
}
