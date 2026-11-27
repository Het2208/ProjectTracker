IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [ProjectMaster] (
        [ProjectId] int NOT NULL IDENTITY,
        [ProjectTitle] nvarchar(200) NOT NULL,
        [Description] nvarchar(250) NULL,
        CONSTRAINT [PK_ProjectMaster] PRIMARY KEY ([ProjectId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [Role] (
        [RoleId] int NOT NULL IDENTITY,
        [RoleName] nvarchar(450) NOT NULL,
        [Description] nvarchar(250) NULL,
        CONSTRAINT [PK_Role] PRIMARY KEY ([RoleId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [TaskPriority] (
        [TaskPriorityId] int NOT NULL IDENTITY,
        [TaskPriorityName] nvarchar(20) NOT NULL,
        [TaskPriorityCssClass] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_TaskPriority] PRIMARY KEY ([TaskPriorityId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [TaskStatus] (
        [TaskStatusID] int NOT NULL IDENTITY,
        [TaskStatusName] nvarchar(20) NOT NULL,
        [TaskStatusCssClass] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_TaskStatus] PRIMARY KEY ([TaskStatusID])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [UserType] (
        [UserTypeId] int NOT NULL IDENTITY,
        [UserTypeName] nvarchar(50) NOT NULL,
        [Description] nvarchar(250) NULL,
        CONSTRAINT [PK_UserType] PRIMARY KEY ([UserTypeId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [User] (
        [UserId] int NOT NULL IDENTITY,
        [UserTypeId] int NOT NULL,
        [FullName] nvarchar(250) NOT NULL,
        [UserCode] nvarchar(max) NULL,
        [Email] nvarchar(150) NOT NULL,
        [Password] nvarchar(255) NOT NULL,
        [MobileNumber] nvarchar(15) NOT NULL,
        [ProfilePicturePath] nvarchar(500) NOT NULL,
        [IsActive] bit NOT NULL,
        [IsDeleted] bit NULL,
        CONSTRAINT [PK_User] PRIMARY KEY ([UserId]),
        CONSTRAINT [FK_User_UserType_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [UserType] ([UserTypeId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [ProjectAllocation] (
        [ProjectAllocationID] int NOT NULL IDENTITY,
        [ProjectID] int NOT NULL,
        [StudentID] int NOT NULL,
        [FacultyID] int NOT NULL,
        [AssignedDate] datetime2 NOT NULL,
        [ProjectStartDate] datetime2 NOT NULL,
        [ProjectEndDate] datetime2 NOT NULL,
        [TotalTasksGiven] int NOT NULL,
        [TotalCompletedTasks] int NOT NULL,
        [ProgressPercentage] decimal(5,2) NOT NULL,
        [OverAllGrade] nvarchar(1) NULL,
        CONSTRAINT [PK_ProjectAllocation] PRIMARY KEY ([ProjectAllocationID]),
        CONSTRAINT [FK_ProjectAllocation_ProjectMaster_ProjectID] FOREIGN KEY ([ProjectID]) REFERENCES [ProjectMaster] ([ProjectId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProjectAllocation_User_FacultyID] FOREIGN KEY ([FacultyID]) REFERENCES [User] ([UserId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ProjectAllocation_User_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [User] ([UserId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [UserRole] (
        [RolePermissionId] int NOT NULL IDENTITY,
        [RoleId] int NOT NULL,
        [UserId] int NOT NULL,
        CONSTRAINT [PK_UserRole] PRIMARY KEY ([RolePermissionId]),
        CONSTRAINT [FK_UserRole_Role_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Role] ([RoleId]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRole_User_UserId] FOREIGN KEY ([UserId]) REFERENCES [User] ([UserId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE TABLE [Task] (
        [TaskID] int NOT NULL IDENTITY,
        [ProjectAllocationID] int NOT NULL,
        [TaskTitle] nvarchar(max) NOT NULL,
        [TaskDescription] nvarchar(max) NULL,
        [TaskStatusID] int NOT NULL,
        [TaskPriorityID] int NOT NULL,
        [AssignedScore] decimal(5,2) NOT NULL,
        [EarnedScore] decimal(5,2) NULL,
        [ProgressPercentage] decimal(5,2) NOT NULL,
        [TaskAssignnedDate] datetime2 NOT NULL,
        [TaskStartDate] datetime2 NULL,
        [TaskEndDate] datetime2 NULL,
        [TaskCompletedTime] datetime2 NULL,
        [NextFollowUpDate] datetime2 NULL,
        [FacultyRemarks] nvarchar(500) NULL,
        [StudentRemarks] nvarchar(500) NULL,
        CONSTRAINT [PK_Task] PRIMARY KEY ([TaskID]),
        CONSTRAINT [FK_Task_ProjectAllocation_ProjectAllocationID] FOREIGN KEY ([ProjectAllocationID]) REFERENCES [ProjectAllocation] ([ProjectAllocationID]) ON DELETE CASCADE,
        CONSTRAINT [FK_Task_TaskPriority_TaskPriorityID] FOREIGN KEY ([TaskPriorityID]) REFERENCES [TaskPriority] ([TaskPriorityId]) ON DELETE CASCADE,
        CONSTRAINT [FK_Task_TaskStatus_TaskStatusID] FOREIGN KEY ([TaskStatusID]) REFERENCES [TaskStatus] ([TaskStatusID]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProjectAllocation_FacultyID] ON [ProjectAllocation] ([FacultyID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProjectAllocation_ProjectID] ON [ProjectAllocation] ([ProjectID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ProjectAllocation_StudentID] ON [ProjectAllocation] ([StudentID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ProjectMaster_ProjectTitle] ON [ProjectMaster] ([ProjectTitle]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Role_RoleName] ON [Role] ([RoleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Task_ProjectAllocationID] ON [Task] ([ProjectAllocationID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Task_TaskPriorityID] ON [Task] ([TaskPriorityID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Task_TaskStatusID] ON [Task] ([TaskStatusID]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_TaskPriority_TaskPriorityName] ON [TaskPriority] ([TaskPriorityName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_TaskStatus_TaskStatusName] ON [TaskStatus] ([TaskStatusName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_User_Email] ON [User] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_User_UserTypeId] ON [User] ([UserTypeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserRole_RoleId] ON [UserRole] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserRole_UserId] ON [UserRole] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserType_UserTypeName] ON [UserType] ([UserTypeName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801113107_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260801113107_InitialCreate', N'10.0.10');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [ProjectAllocation] DROP CONSTRAINT [FK_ProjectAllocation_User_FacultyID];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [ProjectAllocation] DROP CONSTRAINT [FK_ProjectAllocation_User_StudentID];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [User] DROP CONSTRAINT [FK_User_UserType_UserTypeId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [UserRole] DROP CONSTRAINT [FK_UserRole_User_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [User] DROP CONSTRAINT [PK_User];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    EXEC sp_rename N'[User]', N'Users', 'OBJECT';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    EXEC sp_rename N'[Users].[IX_User_UserTypeId]', N'IX_Users_UserTypeId', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    EXEC sp_rename N'[Users].[IX_User_Email]', N'IX_Users_Email', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [Users] ADD CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [ProjectAllocation] ADD CONSTRAINT [FK_ProjectAllocation_Users_FacultyID] FOREIGN KEY ([FacultyID]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [ProjectAllocation] ADD CONSTRAINT [FK_ProjectAllocation_Users_StudentID] FOREIGN KEY ([StudentID]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [UserRole] ADD CONSTRAINT [FK_UserRole_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    ALTER TABLE [Users] ADD CONSTRAINT [FK_Users_UserType_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [UserType] ([UserTypeId]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801114723_secondCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260801114723_secondCreate', N'10.0.10');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    DROP INDEX [IX_UserRole_RoleId] ON [UserRole];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    EXEC sp_rename N'[Task].[TaskEndDate]', N'TaskDueDate', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    EXEC sp_rename N'[Task].[TaskCompletedTime]', N'TaskCompletedDate', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    EXEC sp_rename N'[Task].[TaskAssignnedDate]', N'TaskAssignedDate', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Users]') AND [c].[name] = N'UserCode');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [Users] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [Users] ALTER COLUMN [UserCode] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    DECLARE @var1 nvarchar(max);
    SELECT @var1 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Users]') AND [c].[name] = N'FullName');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Users] DROP CONSTRAINT ' + @var1 + ';');
    ALTER TABLE [Users] ALTER COLUMN [FullName] nvarchar(150) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    DECLARE @var2 nvarchar(max);
    SELECT @var2 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[TaskStatus]') AND [c].[name] = N'TaskStatusCssClass');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [TaskStatus] DROP CONSTRAINT ' + @var2 + ';');
    ALTER TABLE [TaskStatus] ALTER COLUMN [TaskStatusCssClass] nvarchar(100) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    DECLARE @var3 nvarchar(max);
    SELECT @var3 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Task]') AND [c].[name] = N'TaskTitle');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Task] DROP CONSTRAINT ' + @var3 + ';');
    ALTER TABLE [Task] ALTER COLUMN [TaskTitle] nvarchar(200) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    DROP INDEX [IX_Role_RoleName] ON [Role];
    DECLARE @var4 nvarchar(max);
    SELECT @var4 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Role]') AND [c].[name] = N'RoleName');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Role] DROP CONSTRAINT ' + @var4 + ';');
    ALTER TABLE [Role] ALTER COLUMN [RoleName] nvarchar(50) NOT NULL;
    CREATE UNIQUE INDEX [IX_Role_RoleName] ON [Role] ([RoleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    DECLARE @var5 nvarchar(max);
    SELECT @var5 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ProjectMaster]') AND [c].[name] = N'Description');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [ProjectMaster] DROP CONSTRAINT ' + @var5 + ';');
    ALTER TABLE [ProjectMaster] ALTER COLUMN [Description] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserRole_RoleId_UserId] ON [UserRole] ([RoleId], [UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260801115306_thirdCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260801115306_thirdCreate', N'10.0.10');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Task] DROP CONSTRAINT [FK_Task_ProjectAllocation_ProjectAllocationID];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Task] DROP CONSTRAINT [FK_Task_TaskPriority_TaskPriorityID];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Task] DROP CONSTRAINT [FK_Task_TaskStatus_TaskStatusID];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [UserRole] DROP CONSTRAINT [FK_UserRole_Role_RoleId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [UserRole] DROP CONSTRAINT [FK_UserRole_Users_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Users] DROP CONSTRAINT [FK_Users_UserType_UserTypeId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Task] ADD CONSTRAINT [FK_Task_ProjectAllocation_ProjectAllocationID] FOREIGN KEY ([ProjectAllocationID]) REFERENCES [ProjectAllocation] ([ProjectAllocationID]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Task] ADD CONSTRAINT [FK_Task_TaskPriority_TaskPriorityID] FOREIGN KEY ([TaskPriorityID]) REFERENCES [TaskPriority] ([TaskPriorityId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Task] ADD CONSTRAINT [FK_Task_TaskStatus_TaskStatusID] FOREIGN KEY ([TaskStatusID]) REFERENCES [TaskStatus] ([TaskStatusID]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [UserRole] ADD CONSTRAINT [FK_UserRole_Role_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Role] ([RoleId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [UserRole] ADD CONSTRAINT [FK_UserRole_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    ALTER TABLE [Users] ADD CONSTRAINT [FK_Users_UserType_UserTypeId] FOREIGN KEY ([UserTypeId]) REFERENCES [UserType] ([UserTypeId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260818145014_fouthCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260818145014_fouthCreate', N'10.0.10');
END;

COMMIT;
GO

