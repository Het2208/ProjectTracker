import apiClient from './apiClient';

// Every DashboardController endpoint (all GET, all Admin-only).
const endpoint = '/Dashboard';

const get = async (action) => (await apiClient.get(`${endpoint}/${action}`)).data;

export const dashboardService = {
  // Counts
  getRoleCount: async () => get('GetRoleCount'),
  getUserTypeCount: async () => get('GetUserTypeCount'),
  getUserCount: async () => get('GetUserCount'),
  getUserRoleCount: async () => get('GetUserRoleCount'),
  getTaskStatusCount: async () => get('GetTaskStatusCount'),
  getTaskPriorityCount: async () => get('GetTaskPriorityCount'),
  getProjectMasterCount: async () => get('GetProjectMasterCount'),
  getProjectAllocationCount: async () => get('GetProjectAllocationCount'),
  getTaskCount: async () => get('GetTaskCount'),
  // Headline numbers
  getTotalStudents: async () => get('GetTotalStudents'),
  getTotalFaculty: async () => get('GetTotalFaculty'),
  getTotalProjects: async () => get('GetTotalProjects'),
  // Reports
  getTaskStatusSummary: async () => get('GetTaskStatusSummary'),
  getPrioritySummary: async () => get('GetPrioritySummary'),
  getFacultyWorkload: async () => get('GetFacultyWorkload'),
  getStudentTasks: async () => get('GetStudentTasks'),
  getTopStudents: async () => get('GetTopStudents'),
  getBottomStudents: async () => get('GetBottomStudents'),
  getOverdueTasks: async () => get('GetOverdueTasks'),
  getUpcomingFollowUps: async () => get('GetUpcomingFollowUps'),
  getGradeDistribution: async () => get('GetGradeDistribution'),
  getMonthlyCompletion: async () => get('GetMonthlyCompletion'),
  getRoleWiseActiveUserCount: async () => get('GetRoleWiseActiveUserCount'),
  getUsersByRole: async () => get('GetUsersByRole'),
  getRolesWithMoreThanTenUsers: async () => get('GetRolesWithMoreThanTenUsers'),
  getRoleStatistics: async () => get('GetRoleStatistics'),
  getUpcomingDueTasks: async () => get('GetUpcomingDueTasks'),
  getProjectTaskSummary: async () => get('GetProjectTaskSummary'),
  getProjectScoreSummary: async () => get('GetProjectScoreSummary'),
  getTopProjectsByScore: async () => get('GetTopProjectsByScore'),
  getFacultyStatistics: async () => get('GetFacultyStatistics'),
  getStudentTaskStatistics: async () => get('GetStudentTaskStatistics'),
  getOverdueProjects: async () => get('GetOverdueProjects'),
  getMonthlyCompletedTaskCount: async () => get('GetMonthlyCompletedTaskCount'),
  getFacultyRankingsByProgress: async () => get('GetFacultyRankingsByProgress'),
  getProjectTaskStatistics: async () => get('GetProjectTaskStatistics'),
};
