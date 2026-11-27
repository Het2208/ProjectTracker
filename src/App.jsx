import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './common/Login';
import Register from './common/Register';
import Forbidden from './common/Forbidden';
import ProtectedRoute from './common/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

import StudentDashboard from './student/StudentDashboard';
import StudentProfile from './student/StudentProfile';
import StudentProjectDetails from './student/ProjectDetails';
import StudentTasksList from './student/StudentTasks';
import StudentTeamMembers from './student/TeamMembers';
import StudentWeeklyReports from './student/WeeklyReports';
import StudentScoresGrades from './student/ScoresGrades';

import FacultyDashboard from './faculty/FacultyDashboard';
import FacultyProfile from './faculty/FacultyProfile';
import FacultyManageTasks from './faculty/ManageTasks';
import FacultyProjectAllocations from './faculty/ProjectAllocations';
import FacultyManageProjects from './faculty/ManageProjects';
import FacultyStudentBatches from './faculty/StudentBatches';
import FacultyTaskEvaluations from './faculty/TaskEvaluations';
import FacultySubmissionsFeedback from './faculty/SubmissionsFeedback';

import AdminDashboard from './admin/AdminDashboard';
import AdminProfile from './admin/AdminProfile';
import AdminManageRoles from './admin/ManageRoles';
import AdminManageUsers from './admin/ManageUsers';
import AdminManageUserTypes from './admin/ManageUserTypes';
import AdminManageUserRoles from './admin/ManageUserRoles';
import AdminManageTaskStatus from './admin/ManageTaskStatus';
import AdminManageTaskPriority from './admin/ManageTaskPriority';
import AdminManageProjectMaster from './admin/ManageProjectMaster';
import AdminManageProjectAllocations from './admin/ManageProjectAllocations';
import AdminManageTasks from './admin/ManageTasks';
import AdminManageStudents from './admin/ManageStudents';
import AdminManageFaculty from './admin/ManageFaculty';
import AdminManageProjects from './admin/ManageProjects';
import AdminScoresRemarks from './admin/ScoresRemarks';
import AdminRolePermissions from './admin/RolePermissions';
import AdminReports from './admin/AdminReports';

const RoleRoute = ({ role, children }) => <ProtectedRoute allowedRoles={[role]}>{children}</ProtectedRoute>;

function UnauthorizedHandler() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    const handleUnauthorized = () => {
      if (window.location.pathname !== '/') navigate('/', { replace: true });
    };
    window.addEventListener('project-tracker:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('project-tracker:unauthorized', handleUnauthorized);
  }, [navigate]);
  // Keeping a consumer open ensures re-render when the session is cleared.
  return isAuthenticated ? null : null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <UnauthorizedHandler />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Student Workspace Routes */}
          <Route path="/student/dashboard" element={<RoleRoute role="Student"><StudentDashboard /></RoleRoute>} />
          <Route path="/student/project" element={<RoleRoute role="Student"><StudentProjectDetails /></RoleRoute>} />
          <Route path="/student/tasks" element={<RoleRoute role="Student"><StudentTasksList /></RoleRoute>} />
          <Route path="/student/team" element={<RoleRoute role="Student"><StudentTeamMembers /></RoleRoute>} />
          <Route path="/student/reports" element={<RoleRoute role="Student"><StudentWeeklyReports /></RoleRoute>} />
          <Route path="/student/scores" element={<RoleRoute role="Student"><StudentScoresGrades /></RoleRoute>} />
          <Route path="/student/profile" element={<RoleRoute role="Student"><StudentProfile /></RoleRoute>} />

          {/* Faculty Workspace Routes */}
          <Route path="/faculty/dashboard" element={<RoleRoute role="Faculty"><FacultyDashboard /></RoleRoute>} />
          <Route path="/faculty/tasks" element={<RoleRoute role="Faculty"><FacultyManageTasks /></RoleRoute>} />
          <Route path="/faculty/allocations" element={<RoleRoute role="Faculty"><FacultyProjectAllocations /></RoleRoute>} />
          <Route path="/faculty/projects" element={<RoleRoute role="Faculty"><FacultyManageProjects /></RoleRoute>} />
          <Route path="/faculty/batches" element={<RoleRoute role="Faculty"><FacultyStudentBatches /></RoleRoute>} />
          <Route path="/faculty/evaluations" element={<RoleRoute role="Faculty"><FacultyTaskEvaluations /></RoleRoute>} />
          <Route path="/faculty/feedback" element={<RoleRoute role="Faculty"><FacultySubmissionsFeedback /></RoleRoute>} />
          <Route path="/faculty/profile" element={<RoleRoute role="Faculty"><FacultyProfile /></RoleRoute>} />

          {/* Admin Workspace Routes */}
          <Route path="/admin/dashboard" element={<RoleRoute role="Admin"><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/reports" element={<RoleRoute role="Admin"><AdminReports /></RoleRoute>} />
          <Route path="/admin/roles" element={<RoleRoute role="Admin"><AdminManageRoles /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute role="Admin"><AdminManageUsers /></RoleRoute>} />
          <Route path="/admin/user-types" element={<RoleRoute role="Admin"><AdminManageUserTypes /></RoleRoute>} />
          <Route path="/admin/user-roles" element={<RoleRoute role="Admin"><AdminManageUserRoles /></RoleRoute>} />
          <Route path="/admin/task-status" element={<RoleRoute role="Admin"><AdminManageTaskStatus /></RoleRoute>} />
          <Route path="/admin/task-priority" element={<RoleRoute role="Admin"><AdminManageTaskPriority /></RoleRoute>} />
          <Route path="/admin/project-master" element={<RoleRoute role="Admin"><AdminManageProjectMaster /></RoleRoute>} />
          <Route path="/admin/project-allocations" element={<RoleRoute role="Admin"><AdminManageProjectAllocations /></RoleRoute>} />
          <Route path="/admin/tasks" element={<RoleRoute role="Admin"><AdminManageTasks /></RoleRoute>} />
          <Route path="/admin/students" element={<RoleRoute role="Admin"><AdminManageStudents /></RoleRoute>} />
          <Route path="/admin/faculty" element={<RoleRoute role="Admin"><AdminManageFaculty /></RoleRoute>} />
          <Route path="/admin/projects" element={<RoleRoute role="Admin"><AdminManageProjects /></RoleRoute>} />
          <Route path="/admin/scores" element={<RoleRoute role="Admin"><AdminScoresRemarks /></RoleRoute>} />
          <Route path="/admin/role-permissions" element={<RoleRoute role="Admin"><AdminRolePermissions /></RoleRoute>} />
          <Route path="/admin/profile" element={<RoleRoute role="Admin"><AdminProfile /></RoleRoute>} />

          {/* Catch-all redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
