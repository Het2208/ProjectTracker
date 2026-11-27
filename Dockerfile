# ==============================================================================
# Multi-stage production Dockerfile for ASP.NET Core 10 Web API
# Optimized for Azure Container Apps and Render
# ==============================================================================

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["Project_Tracker_Backend/Project_Tracker_Backend.csproj", "Project_Tracker_Backend/"]
RUN dotnet restore "Project_Tracker_Backend/Project_Tracker_Backend.csproj"

# Copy source code and build
COPY . .
WORKDIR "/src/Project_Tracker_Backend"
RUN dotnet build "Project_Tracker_Backend.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Project_Tracker_Backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Install curl for container health checking
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Default listening port and environment (standardizes on 8080 for Azure/Cloud with Render PORT support)
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV PORT=8080

# Create persistent storage directory for uploads
RUN mkdir -p /app/wwwroot/Files && chmod -R 777 /app/wwwroot/Files

COPY --from=publish /app/publish .

# Expose standard container port
EXPOSE 8080

# Healthcheck instruction
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/health/live || exit 1

ENTRYPOINT ["dotnet", "Project_Tracker_Backend.dll"]
