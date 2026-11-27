# =========================================
# Build Stage
# =========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["Project_Tracker_Backend/Project_Tracker_Backend.csproj", "Project_Tracker_Backend/"]

RUN dotnet restore "Project_Tracker_Backend/Project_Tracker_Backend.csproj"

COPY . .

WORKDIR /src/Project_Tracker_Backend

RUN dotnet publish "Project_Tracker_Backend.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# =========================================
# Runtime Stage
# =========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production

ENV ASPNETCORE_URLS=http://+:8080

ENV PORT=8080

RUN mkdir -p /app/wwwroot/Files

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Project_Tracker_Backend.dll"]
