import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './common/Login';
import Register from './common/Register';

import StudentDashboard from './student/StudentDashboard';
import StudentProfile from './student/StudentProfile';
import StudentProjectDetails from './student/ProjectDetails';
import StudentTasksList from './student/StudentTasks';
import StudentTeamMembers from './student/TeamMembers';
import StudentWeeklyReports from './student/WeeklyReports';
import StudentScoresGrades from './student/ScoresGrades';

import FacultyDashboard from './faculty/FacultyDashboard';
import FacultyProfile from './faculty/FacultyProfile';
import FacultyManageProjects from './faculty/ManageProjects';
import FacultyManageTasks from './faculty/ManageTasks';
import FacultyTaskEvaluations from './faculty/TaskEvaluations';
import FacultyStudentBatches from './faculty/StudentBatches';
import FacultyProjectAllocations from './faculty/ProjectAllocations';
import FacultySubmissionsFeedback from './faculty/SubmissionsFeedback';

import AdminDashboard from './admin/AdminDashboard';
import AdminProfile from './admin/AdminProfile';
import AdminManageRoles from './admin/ManageRoles';
import AdminManageUsers from './admin/ManageUsers';
import AdminManageStudents from './admin/ManageStudents';
import AdminManageFaculty from './admin/ManageFaculty';
import AdminRolePermissions from './admin/RolePermissions';
import AdminManageProjects from './admin/ManageProjects';
import AdminManageTasks from './admin/ManageTasks';
import AdminScoresRemarks from './admin/ScoresRemarks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Workspace Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/project" element={<StudentProjectDetails />} />
        <Route path="/student/tasks" element={<StudentTasksList />} />
        <Route path="/student/team" element={<StudentTeamMembers />} />
        <Route path="/student/reports" element={<StudentWeeklyReports />} />
        <Route path="/student/grades" element={<StudentScoresGrades />} />
        <Route path="/student/profile" element={<StudentProfile />} />

        {/* Faculty Workspace Routes */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/projects" element={<FacultyManageProjects />} />
        <Route path="/faculty/tasks" element={<FacultyManageTasks />} />
        <Route path="/faculty/evaluations" element={<FacultyTaskEvaluations />} />
        <Route path="/faculty/batches" element={<FacultyStudentBatches />} />
        <Route path="/faculty/allocations" element={<FacultyProjectAllocations />} />
        <Route path="/faculty/feedback" element={<FacultySubmissionsFeedback />} />
        <Route path="/faculty/profile" element={<FacultyProfile />} />

        {/* Admin Workspace Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/roles" element={<AdminManageRoles />} />
        <Route path="/admin/users" element={<AdminManageUsers />} />
        <Route path="/admin/students" element={<AdminManageStudents />} />
        <Route path="/admin/faculty" element={<AdminManageFaculty />} />
        <Route path="/admin/permissions" element={<AdminRolePermissions />} />
        <Route path="/admin/projects" element={<AdminManageProjects />} />
        <Route path="/admin/tasks" element={<AdminManageTasks />} />
        <Route path="/admin/scores" element={<AdminScoresRemarks />} />
        <Route path="/admin/profile" element={<AdminProfile />} />

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
