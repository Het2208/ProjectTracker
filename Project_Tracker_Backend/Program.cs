using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Project_Tracker_Backend.Data;
using Project_Tracker_Backend.Repository.RoleRepository;
using Project_Tracker_Backend.Services;
using Scalar.AspNetCore;
using System.Text;
using System.Threading.RateLimiting;

namespace Project_Tracker_Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configure port binding: Support Render's PORT environment variable
            var port = Environment.GetEnvironmentVariable("PORT");
            if (!string.IsNullOrEmpty(port))
            {
                builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
            }

            // OpenAPI and Scalar documentation (enabled in Development only)
            builder.Services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer(
                    (document, context, cancellationToken) =>
                    {
                        document.Components ??= new OpenApiComponents();
                        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

                        document.Components.SecuritySchemes["Bearer"] =
                            new OpenApiSecurityScheme
                            {
                                Type = SecuritySchemeType.Http,
                                Scheme = "bearer",
                                BearerFormat = "JWT",
                                In = ParameterLocation.Header,
                                Description = "Enter your JWT Bearer token"
                            };

                        return Task.CompletedTask;
                    });
            });

            // File storage configuration (supports Render persistent disk via FileStorage:BasePath)
            var webRootPath = builder.Configuration["FileStorage:BasePath"]
                ?? builder.Environment.WebRootPath
                ?? Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
            if (!Directory.Exists(webRootPath))
            {
                Directory.CreateDirectory(webRootPath);
            }
            builder.Environment.WebRootPath = webRootPath;

            builder.Services.AddScoped<IFileService, FileService>();
            builder.Services.AddSingleton<IPasswordService, PasswordService>();

            // Request size limiting
            builder.Services.Configure<FormOptions>(options =>
            {
                options.MultipartBodyLengthLimit = 15 * 1024 * 1024; // 15MB
            });

            builder.Services.AddControllers();

            // SQL Server DbContext with transient fault connection resiliency
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                });
            });

            // Health Checks (readiness checks database connectivity)
            builder.Services.AddHealthChecks()
                .AddCheck<DatabaseHealthCheck>("database_ready");

            builder.Services.AddScoped<TokenService>();
            builder.Services.AddScoped<IRoleRepository, RoleRepository>();
            builder.Services.AddScoped<IRoleService, RoleService>();

            // CORS Policy configuration
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ProductionCors", policy =>
                {
                    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                        ?? new[]
                        {
                            "http://localhost:5173",
                            "http://localhost:3000",
                            "https://localhost:5173"
                        };

                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                          .AllowCredentials();
                });
            });

            // Rate limiting for auth and sensitive endpoints
            builder.Services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddFixedWindowLimiter("AuthLimiter", opt =>
                {
                    opt.PermitLimit = 15;
                    opt.Window = TimeSpan.FromMinutes(1);
                    opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                    opt.QueueLimit = 2;
                });
            });

            // FluentValidation
            builder.Services.AddValidatorsFromAssemblyContaining<Program>();

            // JWT authentication & authorization
            var jwtKey = builder.Configuration["Jwt:Key"]
                ?? Environment.GetEnvironmentVariable("Jwt__Key")
                ?? throw new InvalidOperationException("JWT Key is not configured (Jwt:Key or Jwt__Key).");

            var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ProjectTracker";
            var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ProjectTrackerClient";
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
                options.SaveToken = true;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddAuthorization();

            var app = builder.Build();

            // Reverse proxy forwarded headers for Render / Cloudflare / Azure
            var forwardedHeadersOptions = new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            };
            forwardedHeadersOptions.KnownNetworks.Clear();
            forwardedHeadersOptions.KnownProxies.Clear();
            app.UseForwardedHeaders(forwardedHeadersOptions);

            // Production error handling & security headers
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler(errorApp =>
                {
                    errorApp.Run(async context =>
                    {
                        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                        context.Response.ContentType = "application/json";
                        var response = new
                        {
                            success = false,
                            message = "An unexpected internal server error occurred. Please try again later."
                        };
                        await context.Response.WriteAsJsonAsync(response);
                    });
                });
                app.UseHsts();
            }
            else
            {
                app.MapOpenApi();
                app.MapScalarApiReference("/");
            }

            app.UseHttpsRedirection();

            // Serve uploaded files statically
            app.UseStaticFiles();

            app.UseCors("ProductionCors");

            app.UseRateLimiter();

            app.UseAuthentication();
            app.UseAuthorization();

            // Health check endpoints
            app.MapGet("/health/live", () => Results.Ok(new { status = "live", time = DateTime.UtcNow }));
            app.MapHealthChecks("/health/ready");

            app.MapControllers();

            app.Run();
        }
    }
}
