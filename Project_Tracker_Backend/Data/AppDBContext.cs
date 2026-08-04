using Microsoft.EntityFrameworkCore;
using Project_Tracker_Backend.Models;
using Task = Project_Tracker_Backend.Models.Task;
using TaskStatus = Project_Tracker_Backend.Models.TaskStatus;

namespace Project_Tracker_Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Role> Role => Set<Role>();
        public DbSet<UserType> UserType => Set<UserType>();
        public DbSet<User> Users => Set<User>();
        public DbSet<UserRole> UserRole => Set<UserRole>();
        public DbSet<TaskStatus> TaskStatus => Set<TaskStatus>();
        public DbSet<TaskPriority> TaskPriority => Set<TaskPriority>();
        
        public DbSet<ProjectMaster> ProjectMaster => Set<ProjectMaster>();
        public DbSet<ProjectAllocation> ProjectAllocation => Set<ProjectAllocation>();
        public DbSet<Task> Task => Set<Task>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();


            modelBuilder.Entity<Role>()
                .HasIndex(r => r.RoleName)
                .IsUnique();

            modelBuilder.Entity<UserType>()
                .HasIndex(p => p.UserTypeName)
                .IsUnique();

            // Prevent duplicate user-role pairs
            modelBuilder.Entity<UserRole>()
                .HasIndex(ur => new { ur.RoleId, ur.UserId })
                .IsUnique();

            modelBuilder.Entity<ProjectMaster>()
                .HasIndex(p => p.ProjectTitle)
                .IsUnique();

            modelBuilder.Entity<TaskStatus>()
                .HasIndex(ts => ts.TaskStatusName)
                .IsUnique();

            modelBuilder.Entity<TaskPriority>()
                .HasIndex(tp => tp.TaskPriorityName)
                .IsUnique();

            // Configure relationships
            modelBuilder.Entity<ProjectAllocation>()
                .HasOne(pa => pa.ProjectMaster)
                .WithMany()
                .HasForeignKey(pa => pa.ProjectID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectAllocation>()
                .HasOne(pa => pa.Student)
                .WithMany()
                .HasForeignKey(pa => pa.StudentID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectAllocation>()
                .HasOne(pa => pa.Faculty)
                .WithMany()
                .HasForeignKey(pa => pa.FacultyID)
                .OnDelete(DeleteBehavior.Restrict);


        }
    }


    }   

