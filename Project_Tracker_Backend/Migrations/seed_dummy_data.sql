-- ==============================================================================
-- ProjectTracker Seed / Dummy Data Script
-- Populates lookup tables, test users with hashed passwords, projects, allocations & tasks.
-- ==============================================================================

SET NOCOUNT ON;

BEGIN TRANSACTION;

-- 1. Seed Roles
SET IDENTITY_INSERT dbo.Role ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RoleId = 1)
    INSERT INTO dbo.Role (RoleId, RoleName, Description) VALUES (1, N'Admin', N'System Administrator with full access');
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RoleId = 2)
    INSERT INTO dbo.Role (RoleId, RoleName, Description) VALUES (2, N'Faculty', N'Faculty guide or supervisor');
IF NOT EXISTS (SELECT 1 FROM dbo.Role WHERE RoleId = 3)
    INSERT INTO dbo.Role (RoleId, RoleName, Description) VALUES (3, N'Student', N'Student participating in project');
SET IDENTITY_INSERT dbo.Role OFF;

-- 2. Seed UserTypes
SET IDENTITY_INSERT dbo.UserType ON;
IF NOT EXISTS (SELECT 1 FROM dbo.UserType WHERE UserTypeId = 1)
    INSERT INTO dbo.UserType (UserTypeId, UserTypeName, Description) VALUES (1, N'Admin', N'Administrative staff');
IF NOT EXISTS (SELECT 1 FROM dbo.UserType WHERE UserTypeId = 2)
    INSERT INTO dbo.UserType (UserTypeId, UserTypeName, Description) VALUES (2, N'Faculty', N'Teaching and mentoring faculty');
IF NOT EXISTS (SELECT 1 FROM dbo.UserType WHERE UserTypeId = 3)
    INSERT INTO dbo.UserType (UserTypeId, UserTypeName, Description) VALUES (3, N'Student', N'Enrolled student');
SET IDENTITY_INSERT dbo.UserType OFF;

-- 3. Seed TaskStatus
SET IDENTITY_INSERT dbo.TaskStatus ON;
IF NOT EXISTS (SELECT 1 FROM dbo.TaskStatus WHERE TaskStatusID = 1)
    INSERT INTO dbo.TaskStatus (TaskStatusID, TaskStatusName, TaskStatusCssClass) VALUES (1, N'Pending', N'badge bg-secondary');
IF NOT EXISTS (SELECT 1 FROM dbo.TaskStatus WHERE TaskStatusID = 2)
    INSERT INTO dbo.TaskStatus (TaskStatusID, TaskStatusName, TaskStatusCssClass) VALUES (2, N'In Progress', N'badge bg-primary');
IF NOT EXISTS (SELECT 1 FROM dbo.TaskStatus WHERE TaskStatusID = 3)
    INSERT INTO dbo.TaskStatus (TaskStatusID, TaskStatusName, TaskStatusCssClass) VALUES (3, N'Submitted', N'badge bg-info');
IF NOT EXISTS (SELECT 1 FROM dbo.TaskStatus WHERE TaskStatusID = 4)
    INSERT INTO dbo.TaskStatus (TaskStatusID, TaskStatusName, TaskStatusCssClass) VALUES (4, N'Completed', N'badge bg-success');
IF NOT EXISTS (SELECT 1 FROM dbo.TaskStatus WHERE TaskStatusID = 5)
    INSERT INTO dbo.TaskStatus (TaskStatusID, TaskStatusName, TaskStatusCssClass) VALUES (5, N'Rejected', N'badge bg-danger');
SET IDENTITY_INSERT dbo.TaskStatus OFF;

-- 4. Seed TaskPriority
SET IDENTITY_INSERT dbo.TaskPriority ON;
IF NOT EXISTS (SELECT 1 FROM dbo.TaskPriority WHERE TaskPriorityId = 1)
    INSERT INTO dbo.TaskPriority (TaskPriorityId, TaskPriorityName, TaskPriorityCssClass) VALUES (1, N'Low', N'badge bg-secondary');
IF NOT EXISTS (SELECT 1 FROM dbo.TaskPriority WHERE TaskPriorityId = 2)
    INSERT INTO dbo.TaskPriority (TaskPriorityId, TaskPriorityName, TaskPriorityCssClass) VALUES (2, N'Medium', N'badge bg-info');
IF NOT EXISTS (SELECT 1 FROM dbo.TaskPriority WHERE TaskPriorityId = 3)
    INSERT INTO dbo.TaskPriority (TaskPriorityId, TaskPriorityName, TaskPriorityCssClass) VALUES (3, N'High', N'badge bg-warning');
IF NOT EXISTS (SELECT 1 FROM dbo.TaskPriority WHERE TaskPriorityId = 4)
    INSERT INTO dbo.TaskPriority (TaskPriorityId, TaskPriorityName, TaskPriorityCssClass) VALUES (4, N'Critical', N'badge bg-danger');
SET IDENTITY_INSERT dbo.TaskPriority OFF;

-- 5. Seed Users
-- Passwords:
-- admin@projecttracker.com   -> Admin@123
-- faculty@projecttracker.com -> Faculty@123
-- student@projecttracker.com -> Student@123
-- student2@projecttracker.com -> Student@123
SET IDENTITY_INSERT dbo.Users ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = 1)
    INSERT INTO dbo.Users (UserId, UserTypeId, FullName, UserCode, Email, Password, MobileNumber, ProfilePicturePath, IsActive, IsDeleted)
    VALUES (1, 1, N'System Administrator', N'ADM001', N'admin@projecttracker.com', N'AQAAAAIAAYagAAAAEF0lS4Pvu2BHxikuGLfc1lGVNQZTM6Hx40g94rrAe4yl2S/qpN+8aQ1wBO+1ZgYEHg==', N'9876543210', N'', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = 2)
    INSERT INTO dbo.Users (UserId, UserTypeId, FullName, UserCode, Email, Password, MobileNumber, ProfilePicturePath, IsActive, IsDeleted)
    VALUES (2, 2, N'Dr. Rajesh Sharma', N'FAC001', N'faculty@projecttracker.com', N'AQAAAAIAAYagAAAAEDcNr2IYnlPlVLytriL2FO1VG0cpvNpekCt5Zw5AXESi9XsVvg99m+bUUoNT9nmmXg==', N'9876543211', N'', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = 3)
    INSERT INTO dbo.Users (UserId, UserTypeId, FullName, UserCode, Email, Password, MobileNumber, ProfilePicturePath, IsActive, IsDeleted)
    VALUES (3, 3, N'Het Patel', N'STU001', N'student@projecttracker.com', N'AQAAAAIAAYagAAAAEKPxnMysGT15OBLwHSR3jmdroqdgsaQYknujEPWGa2hi8tHN3zEB/9GOMiF95JXN8Q==', N'9876543212', N'', 1, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = 4)
    INSERT INTO dbo.Users (UserId, UserTypeId, FullName, UserCode, Email, Password, MobileNumber, ProfilePicturePath, IsActive, IsDeleted)
    VALUES (4, 3, N'Aarav Shah', N'STU002', N'student2@projecttracker.com', N'AQAAAAIAAYagAAAAEKPxnMysGT15OBLwHSR3jmdroqdgsaQYknujEPWGa2hi8tHN3zEB/9GOMiF95JXN8Q==', N'9876543213', N'', 1, 0);
SET IDENTITY_INSERT dbo.Users OFF;

-- 6. Seed UserRole mappings
SET IDENTITY_INSERT dbo.UserRole ON;
IF NOT EXISTS (SELECT 1 FROM dbo.UserRole WHERE RolePermissionId = 1)
    INSERT INTO dbo.UserRole (RolePermissionId, RoleId, UserId) VALUES (1, 1, 1);
IF NOT EXISTS (SELECT 1 FROM dbo.UserRole WHERE RolePermissionId = 2)
    INSERT INTO dbo.UserRole (RolePermissionId, RoleId, UserId) VALUES (2, 2, 2);
IF NOT EXISTS (SELECT 1 FROM dbo.UserRole WHERE RolePermissionId = 3)
    INSERT INTO dbo.UserRole (RolePermissionId, RoleId, UserId) VALUES (3, 3, 3);
IF NOT EXISTS (SELECT 1 FROM dbo.UserRole WHERE RolePermissionId = 4)
    INSERT INTO dbo.UserRole (RolePermissionId, RoleId, UserId) VALUES (4, 3, 4);
SET IDENTITY_INSERT dbo.UserRole OFF;

-- 7. Seed ProjectMaster
SET IDENTITY_INSERT dbo.ProjectMaster ON;
IF NOT EXISTS (SELECT 1 FROM dbo.ProjectMaster WHERE ProjectId = 1)
    INSERT INTO dbo.ProjectMaster (ProjectId, ProjectTitle, Description)
    VALUES (1, N'AI-Powered Student Performance Analytics', N'An intelligent analytics platform for predicting student learning trajectories using machine learning.');

IF NOT EXISTS (SELECT 1 FROM dbo.ProjectMaster WHERE ProjectId = 2)
    INSERT INTO dbo.ProjectMaster (ProjectId, ProjectTitle, Description)
    VALUES (2, N'Campus IoT Asset Tracking System', N'Real-time tracking of high-value laboratory equipment using BLE and LoRaWAN beacons.');
SET IDENTITY_INSERT dbo.ProjectMaster OFF;

-- 8. Seed ProjectAllocation
SET IDENTITY_INSERT dbo.ProjectAllocation ON;
IF NOT EXISTS (SELECT 1 FROM dbo.ProjectAllocation WHERE ProjectAllocationID = 1)
    INSERT INTO dbo.ProjectAllocation (ProjectAllocationID, ProjectID, StudentID, FacultyID, AssignedDate, ProjectStartDate, ProjectEndDate, TotalTasksGiven, TotalCompletedTasks, ProgressPercentage, OverAllGrade)
    VALUES (1, 1, 3, 2, '2026-08-01T00:00:00', '2026-08-05T00:00:00', '2026-12-15T00:00:00', 3, 1, 33.33, N'A');

IF NOT EXISTS (SELECT 1 FROM dbo.ProjectAllocation WHERE ProjectAllocationID = 2)
    INSERT INTO dbo.ProjectAllocation (ProjectAllocationID, ProjectID, StudentID, FacultyID, AssignedDate, ProjectStartDate, ProjectEndDate, TotalTasksGiven, TotalCompletedTasks, ProgressPercentage, OverAllGrade)
    VALUES (2, 2, 4, 2, '2026-08-01T00:00:00', '2026-08-10T00:00:00', '2026-12-20T00:00:00', 2, 0, 0.00, N'B');
SET IDENTITY_INSERT dbo.ProjectAllocation OFF;

-- 9. Seed Tasks
SET IDENTITY_INSERT dbo.Task ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Task WHERE TaskID = 1)
    INSERT INTO dbo.Task (TaskID, ProjectAllocationID, TaskTitle, TaskDescription, TaskStatusID, TaskPriorityID, AssignedScore, EarnedScore, ProgressPercentage, TaskAssignedDate, TaskStartDate, TaskDueDate, TaskCompletedDate, NextFollowUpDate, FacultyRemarks, StudentRemarks)
    VALUES (1, 1, N'Literature Survey & Architecture Diagram', N'Conduct comprehensive survey of existing predictive models and submit system design.', 4, 3, 20.0, 19.0, 100.0, '2026-08-05T00:00:00', '2026-08-06T00:00:00', '2026-08-20T00:00:00', '2026-08-19T00:00:00', NULL, N'Excellent depth of research.', N'Survey completed and document uploaded.');

IF NOT EXISTS (SELECT 1 FROM dbo.Task WHERE TaskID = 2)
    INSERT INTO dbo.Task (TaskID, ProjectAllocationID, TaskTitle, TaskDescription, TaskStatusID, TaskPriorityID, AssignedScore, EarnedScore, ProgressPercentage, TaskAssignedDate, TaskStartDate, TaskDueDate, TaskCompletedDate, NextFollowUpDate, FacultyRemarks, StudentRemarks)
    VALUES (2, 1, N'Data Preprocessing & Feature Engineering', N'Clean raw student records, handle nulls and extract academic progression features.', 2, 3, 30.0, 0.0, 50.0, '2026-08-20T00:00:00', '2026-08-22T00:00:00', '2026-09-15T00:00:00', NULL, '2026-09-10T00:00:00', N'Focus on normalizing semester grading.', N'Working on categorical encoders.');

IF NOT EXISTS (SELECT 1 FROM dbo.Task WHERE TaskID = 3)
    INSERT INTO dbo.Task (TaskID, ProjectAllocationID, TaskTitle, TaskDescription, TaskStatusID, TaskPriorityID, AssignedScore, EarnedScore, ProgressPercentage, TaskAssignedDate, TaskStartDate, TaskDueDate, TaskCompletedDate, NextFollowUpDate, FacultyRemarks, StudentRemarks)
    VALUES (3, 1, N'Model Training & Evaluation', N'Train Random Forest and XGBoost classifiers; report ROC-AUC, Precision and Recall metrics.', 1, 4, 50.0, 0.0, 0.0, '2026-09-15T00:00:00', NULL, '2026-10-15T00:00:00', NULL, '2026-10-01T00:00:00', N'Prepare validation splits before running cross-validation.', NULL);

IF NOT EXISTS (SELECT 1 FROM dbo.Task WHERE TaskID = 4)
    INSERT INTO dbo.Task (TaskID, ProjectAllocationID, TaskTitle, TaskDescription, TaskStatusID, TaskPriorityID, AssignedScore, EarnedScore, ProgressPercentage, TaskAssignedDate, TaskStartDate, TaskDueDate, TaskCompletedDate, NextFollowUpDate, FacultyRemarks, StudentRemarks)
    VALUES (4, 2, N'Hardware Sensor Selection & BOM', N'Compare ESP32, nRF52840 and BLE module costs and power consumption.', 2, 2, 25.0, 0.0, 40.0, '2026-08-10T00:00:00', '2026-08-12T00:00:00', '2026-09-05T00:00:00', NULL, '2026-09-02T00:00:00', N'Ensure power consumption is within coin-cell specifications.', N'Benchmarking battery life curves.');

IF NOT EXISTS (SELECT 1 FROM dbo.Task WHERE TaskID = 5)
    INSERT INTO dbo.Task (TaskID, ProjectAllocationID, TaskTitle, TaskDescription, TaskStatusID, TaskPriorityID, AssignedScore, EarnedScore, ProgressPercentage, TaskAssignedDate, TaskStartDate, TaskDueDate, TaskCompletedDate, NextFollowUpDate, FacultyRemarks, StudentRemarks)
    VALUES (5, 2, N'Gateway Firmware & MQTT Ingestion', N'Implement MQTT broker uplink for edge gateways.', 1, 3, 35.0, 0.0, 0.0, '2026-09-05T00:00:00', NULL, '2026-10-10T00:00:00', NULL, '2026-09-25T00:00:00', NULL, NULL);
SET IDENTITY_INSERT dbo.Task OFF;

COMMIT TRANSACTION;
