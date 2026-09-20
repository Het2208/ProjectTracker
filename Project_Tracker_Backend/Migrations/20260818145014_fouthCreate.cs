using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Project_Tracker_Backend.Migrations
{
    /// <inheritdoc />
    public partial class fouthCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Task_ProjectAllocation_ProjectAllocationID",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_TaskPriority_TaskPriorityID",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_TaskStatus_TaskStatusID",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_Role_RoleId",
                table: "UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_Users_UserId",
                table: "UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserType_UserTypeId",
                table: "Users");

            migrationBuilder.AddForeignKey(
                name: "FK_Task_ProjectAllocation_ProjectAllocationID",
                table: "Task",
                column: "ProjectAllocationID",
                principalTable: "ProjectAllocation",
                principalColumn: "ProjectAllocationID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_TaskPriority_TaskPriorityID",
                table: "Task",
                column: "TaskPriorityID",
                principalTable: "TaskPriority",
                principalColumn: "TaskPriorityId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_TaskStatus_TaskStatusID",
                table: "Task",
                column: "TaskStatusID",
                principalTable: "TaskStatus",
                principalColumn: "TaskStatusID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_Role_RoleId",
                table: "UserRole",
                column: "RoleId",
                principalTable: "Role",
                principalColumn: "RoleId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_Users_UserId",
                table: "UserRole",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserType_UserTypeId",
                table: "Users",
                column: "UserTypeId",
                principalTable: "UserType",
                principalColumn: "UserTypeId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Task_ProjectAllocation_ProjectAllocationID",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_TaskPriority_TaskPriorityID",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_Task_TaskStatus_TaskStatusID",
                table: "Task");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_Role_RoleId",
                table: "UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_Users_UserId",
                table: "UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserType_UserTypeId",
                table: "Users");

            migrationBuilder.AddForeignKey(
                name: "FK_Task_ProjectAllocation_ProjectAllocationID",
                table: "Task",
                column: "ProjectAllocationID",
                principalTable: "ProjectAllocation",
                principalColumn: "ProjectAllocationID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_TaskPriority_TaskPriorityID",
                table: "Task",
                column: "TaskPriorityID",
                principalTable: "TaskPriority",
                principalColumn: "TaskPriorityId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_TaskStatus_TaskStatusID",
                table: "Task",
                column: "TaskStatusID",
                principalTable: "TaskStatus",
                principalColumn: "TaskStatusID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_Role_RoleId",
                table: "UserRole",
                column: "RoleId",
                principalTable: "Role",
                principalColumn: "RoleId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_Users_UserId",
                table: "UserRole",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserType_UserTypeId",
                table: "Users",
                column: "UserTypeId",
                principalTable: "UserType",
                principalColumn: "UserTypeId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
