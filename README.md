# ProjectTracker – Academic & Enterprise Student Project Management System

**ProjectTracker** is a secure, full-stack, enterprise-grade project and task management system built with an **ASP.NET Core Web API (.NET 10)** backend and a **React 19 + Vite 8** frontend. It facilitates end-to-end academic project lifecycle tracking, student deliverable submissions, faculty evaluations, scoring, role permissions, and administrative oversight.

---

## 1. Technology Stack

### Frontend
- **React.js 19** with JSX
- **Vite 8** Build Tool & Dev Server
- **React Router DOM 7** (SPA Client-side Routing & Route Guards)
- **Axios** (Centralized API client with dynamic bearer token interception)
- **CSS3** (Responsive design, dark/light themes, custom component styling)

### Backend
- **ASP.NET Core Web API (.NET 10)**
- **C# 13**
- **Entity Framework Core 10** (SQL Server Provider, Migrations, Connection Resiliency)
- **JWT Bearer Authentication** (HMAC-SHA256, strict issuer/audience validation)
- **ASP.NET Core PasswordHasher** (Cryptographic PBKDF2 with automatic legacy password migration)
- **FluentValidation 12** (Model validation across all DTO contracts)
- **Microsoft.AspNetCore.RateLimiting** (Fixed-window rate limiting on sensitive auth endpoints)
- **Health Checks** (`/health/live`, `/health/ready` testing live DB connectivity)

### Database
- **Microsoft SQL Server / Azure SQL Database**
- Relational schema with foreign keys, cascade delete restrictions, and unique constraints

### Target Deployments
- **Frontend**: [Vercel](https://vercel.com) (Single Page App with catch-all routing via `vercel.json`)
- **Backend**: [Render Web Service](https://render.com) (Linux Container via multi-stage `Dockerfile`)
- **Database**: [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/database/)
- **File Storage**: Render Persistent Disk / volume mount (`/app/wwwroot/Files`)

---

## 2. System Architecture

```
                       ┌─────────────────────────┐
                       │     Browser Client      │
                       │   (React 19 + Vite 8)   │
                       │    Hosted on Vercel     │
                       └────────────┬────────────┘
                                    │ HTTPS + Bearer JWT
                                    ▼
                       ┌─────────────────────────┐
                       │   Render Web Service    │
                       │  (Docker: ASP.NET 10)   │
                       │  - JWT Auth Middleware  │
                       │  - Rate Limiting        │
                       │  - Exception Handling   │
                       │  - File Service         │
                       └─────┬──────────────┬────┘
                             │              │
       SQL Connection (TLS)  │              │ Persistent Disk
                             ▼              ▼
     ┌─────────────────────────┐     ┌───────────────────────┐
     │    Azure SQL Database   │     │ Render Persistent Disk│
     │     (ProjectTracker)    │     │   (/var/data/files)   │
     └─────────────────────────┘     └───────────────────────┘
```

---

## 3. Folder Structure

```
project_tracker/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Continuous integration build & test pipeline
├── Project_Tracker_Backend/           # ASP.NET Core Web API (.NET 10)
│   ├── Comman/                        # Common response wrappers (APIResponse<T>)
│   ├── Controllers/                   # REST API Controllers (User, Role, Task, etc.)
│   ├── Data/                          # AppDbContext and AppDbContextFactory
│   ├── DTOs/                          # Request and response data contracts
│   ├── Migrations/                    # EF Core Migrations and idempotent SQL script
│   ├── Models/                        # Domain entities
│   ├── Repository/                    # Data access abstractions
│   ├── Services/                      # TokenService, PasswordService, FileService, etc.
│   ├── Validators/                    # FluentValidation rules
│   ├── appsettings.json               # Sanitized production configuration
│   ├── appsettings.Development.json.example # Development template
│   └── Program.cs                     # API startup and pipeline composition
├── Project_Tracker_Backend.test/      # xUnit Test Suite (.NET 10)
│   ├── RoleServiceTests.cs
│   └── SecurityAndAuthTests.cs
├── src/                               # React 19 Frontend
│   ├── admin/                         # Admin dashboard & management pages
│   ├── common/                        # Auth, Login, Register, Profile, TableState, Layouts
│   ├── context/                       # AuthContext & state providers
│   ├── faculty/                       # Faculty dashboard & evaluation screens
│   ├── services/                      # Axios apiClient & typed service modules
│   ├── student/                       # Student dashboard, deliverable submission screens
│   ├── App.jsx                        # Role-based router & layout orchestration
│   └── main.jsx                       # Application entrypoint
├── Dockerfile                         # Production multi-stage Docker container for Render
├── .dockerignore                      # Build context exclusion list
├── vercel.json                        # Vercel SPA routing configuration
├── .env.example                       # Frontend environment variable template
├── .gitignore                         # Comprehensive Git ignore
└── README.md                          # Full system documentation
```

---

## 4. Local Development Setup

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 22 LTS](https://nodejs.org/) & `npm`
- [SQL Server Express / Developer Edition](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or Docker SQL Server

### 1. Database Setup
Ensure SQL Server is running locally. You can create the database and apply migrations:
```bash
cd Project_Tracker_Backend
dotnet ef database update
```
*Alternatively, run the idempotent SQL script at `Project_Tracker_Backend/Migrations/production_migration.sql` in SQL Server Management Studio (SSMS) or Azure Data Studio.*

### 2. Backend Setup
1. Copy `Project_Tracker_Backend/appsettings.Development.json.example` to `Project_Tracker_Backend/appsettings.Development.json` (or use User Secrets).
2. Start the backend:
```bash
cd Project_Tracker_Backend
dotnet run
```
The API starts on `https://localhost:7264` (and `http://localhost:5264`). In Development mode, Scalar API documentation is available at `https://localhost:7264/`.

### 3. Frontend Setup
1. Copy `.env.example` to `.env`:
```env
VITE_API_BASE_URL=https://localhost:7264/api
```
2. Install dependencies and start Vite dev server:
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Environment Variable Configuration

### Backend (Render Web Service)
| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `ASPNETCORE_ENVIRONMENT` | `Production` | `Production` |
| `ASPNETCORE_URLS` | Binding host & port | `http://0.0.0.0:10000` |
| `PORT` | Render-assigned HTTP port | `10000` |
| `ConnectionStrings__DefaultConnection` | Azure SQL Connection String | `Server=tcp:myserver.database.windows.net,1433;Initial Catalog=ProjectTracker;Persist Security Info=False;User ID=sqladmin;Password=YourPassword!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;` |
| `Jwt__Key` | Cryptographically secure 256-bit string | *Generate 64+ char random string* |
| `Jwt__Issuer` | Token issuer domain/name | `ProjectTracker` |
| `Jwt__Audience` | Token audience domain/name | `ProjectTrackerClient` |
| `Jwt__ExpiresInMinutes` | Token lifetime | `60` |
| `Cors__AllowedOrigins__0` | Production Vercel domain | `https://your-project.vercel.app` |
| `Cors__AllowedOrigins__1` | Custom domain (if any) | `https://app.yourdomain.com` |
| `FileStorage__BasePath` | Mount point for Render disk | `/var/data/files` |

### Frontend (Vercel)
| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Full URL to backend `/api` endpoint | `https://your-backend.onrender.com/api` |

---

## 6. Authentication & Security Implementation

### Authentication
- **Secure Password Hashing**: Utilizes ASP.NET Core `PasswordHasher<T>` (PBKDF2 with HMAC-SHA512).
- **Zero Lockout Migration**: When legacy users with plaintext passwords log in, the system verifies their plaintext password, immediately hashes it, saves the new hash to the database, and returns a valid session.
- **Strict JWT Verification**: Tokens validate Issuer, Audience, Lifetime, and Cryptographic Signing Key with zero clock skew.
- **Claims Enrichment**: Every token carries `sub`, `userId`, `fullName`, `email`, and `Role` (`Admin`, `Faculty`, or `Student`).
- **Object-Level Authorization**: Non-admin users cannot access or mutate profile data belonging to other users.

### File Upload Security
- Validates file extensions against whitelist (`.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`, `.zip`, etc.).
- Restricts payload size to 10MB per file and 15MB request maximum.
- Generates cryptographically unique GUID file names (`Guid.NewGuid():N + ext`).
- Strips path traversal sequences (`..`, leading slashes).
- Configurable physical disk storage root path surviving service restarts.

---

## 7. API Endpoints Reference

| Controller | Method | Route | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `POST` | `/api/User/login` | Public | Authenticate user and issue JWT |
| **User** | `POST` | `/api/User/register` | Public | Self-registration for Student/Faculty |
| **User** | `GET` | `/api/User/GetAll` | Admin | List all registered users |
| **User** | `GET` | `/api/User/GetById/{id}` | Authenticated | View user profile (Self or Admin) |
| **User** | `POST` | `/api/User/Add` | Admin | Create user account |
| **User** | `PUT` | `/api/User/Update/{id}` | Authenticated | Update user profile (Self or Admin) |
| **User** | `DELETE`| `/api/User/Delete/{id}` | Admin | Soft delete user account |
| **Role** | `GET` | `/api/Role` | Admin | List system roles |
| **ProjectMaster** | `GET` | `/api/ProjectMaster/GetAll` | Authenticated | View all master projects |
| **ProjectMaster** | `POST`| `/api/ProjectMaster/Add` | Admin | Create project master record |
| **ProjectAllocation** | `GET` | `/api/ProjectAllocation/GetAll` | Authenticated | View allocated projects |
| **ProjectAllocation** | `POST`| `/api/ProjectAllocation/Add` | Admin, Faculty | Allocate project to student & faculty |
| **Task** | `GET` | `/api/Task/GetAll` | Authenticated | View all deliverables/tasks |
| **Task** | `POST` | `/api/Task/Add` | Admin, Faculty | Assign deliverable to allocation |
| **Task** | `PUT` | `/api/Task/Update/{id}` | Authenticated | Update progress, score, remarks |
| **Task** | `DELETE`| `/api/Task/Delete/{id}` | Admin, Faculty | Remove task |
| **Dashboard** | `GET` | `/api/Dashboard/*` | Admin | Metrics, stats & analytics reports |
| **Health** | `GET` | `/health/live` | Public | Container liveness check |
| **Health** | `GET` | `/health/ready` | Public | Database readiness check |

---

## 8. Database Migrations

Production database migrations are handled deliberately without dropping tables:
1. An idempotent SQL script is pre-generated at `Project_Tracker_Backend/Migrations/production_migration.sql`.
2. To apply to Azure SQL Database:
   - Connect to Azure SQL via SSMS or Azure Portal Query Editor.
   - Execute `production_migration.sql`. It checks `__EFMigrationsHistory` and only applies missing migrations safely.

---

## 9. Render Backend Deployment Guide

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `Het2208/ProjectTracker`.
4. Configure service parameters:
   - **Name**: `project-tracker-api`
   - **Language**: `Docker`
   - **Branch**: `main`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `.`
   - **Instance Type**: `Starter` or higher (recommended for .NET runtime)
5. Under **Disks** (Optional for persistent uploads):
   - **Name**: `files-storage`
   - **Mount Path**: `/var/data/files`
   - **Size**: `1 GB` (or as required)
6. Under **Environment Variables**, add:
   - `ASPNETCORE_ENVIRONMENT` = `Production`
   - `ConnectionStrings__DefaultConnection` = *<Your Azure SQL Connection String>*
   - `Jwt__Key` = *<Your Generated 64-char Secret>*
   - `Jwt__Issuer` = `ProjectTracker`
   - `Jwt__Audience` = `ProjectTrackerClient`
   - `Cors__AllowedOrigins__0` = `https://your-frontend.vercel.app`
   - `FileStorage__BasePath` = `/var/data/files` *(if persistent disk is attached)*
7. Under **Health Check Path**, enter: `/health/live`
8. Click **Deploy Web Service**.

---

## 10. Vercel Frontend Deployment Guide

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import `Het2208/ProjectTracker`.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci`
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com/api`
6. Click **Deploy**.
7. Once deployed, copy your Vercel URL (e.g. `https://project-tracker-xxx.vercel.app`) and add it to Render's `Cors__AllowedOrigins__0` environment variable.

---

## 11. Azure SQL Database Setup

1. Create a **SQL Database** in the Azure Portal.
2. Under **Networking**, ensure **"Allow Azure services and resources to access this server"** is checked (`Yes`).
3. Add your client IP address to the firewall rules for management.
4. Copy the ADO.NET connection string:
   ```
   Server=tcp:<your-server>.database.windows.net,1433;Initial Catalog=ProjectTracker;Persist Security Info=False;User ID=<admin-username>;Password=<admin-password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
   ```
5. Run the idempotent migration script `production_migration.sql` against the database to create all tables and relationships.

---

## 12. Testing & Verification

### Running Backend Tests
```bash
dotnet test Project_Tracker_Backend.test/Project_Tracker_Backend.test.csproj
```

### Running Frontend Checks
```bash
npm run lint
npm run build
```
Both commands must complete with 0 errors.
