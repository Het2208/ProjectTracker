using Microsoft.Extensions.Diagnostics.HealthChecks;
using Project_Tracker_Backend.Data;

namespace Project_Tracker_Backend.Services
{
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DatabaseHealthCheck> _logger;

        public DatabaseHealthCheck(AppDbContext context, ILogger<DatabaseHealthCheck> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
                return canConnect
                    ? HealthCheckResult.Healthy("Database is responsive.")
                    : HealthCheckResult.Unhealthy("Database is not reachable.");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Health check failed to connect to database");
                return HealthCheckResult.Unhealthy("Database connectivity error.", ex);
            }
        }
    }
}
