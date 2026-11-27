import apiClient from './apiClient';

const endpoint = '/Task';

// Dates are sent as ISO strings; nullable fields become null so the JSON
// serializer leaves them out of the SQL update.
function serializeTaskForm(form) {
  const dateOrNull = (value) => (value ? new Date(value).toISOString() : null);
  return {
    projectAllocationID: Number(form.projectAllocationID),
    taskTitle: form.taskTitle,
    taskDescription: form.taskDescription || null,
    taskStatusID: Number(form.taskStatusID),
    taskPriorityID: Number(form.taskPriorityID),
    assignedScore: Number(form.assignedScore) || 0,
    earnedScore: form.earnedScore === '' || form.earnedScore === null || form.earnedScore === undefined ? null : Number(form.earnedScore),
    progressPercentage: Number(form.progressPercentage) || 0,
    taskAssignedDate: dateOrNull(form.taskAssignedDate) ?? new Date().toISOString(),
    taskStartDate: dateOrNull(form.taskStartDate),
    taskDueDate: dateOrNull(form.taskDueDate),
    taskCompletedDate: dateOrNull(form.taskCompletedDate),
    nextFollowUpDate: dateOrNull(form.nextFollowUpDate),
    facultyRemarks: form.facultyRemarks || null,
    studentRemarks: form.studentRemarks || null,
  };
}

export const taskService = {
  getAll: async () => (await apiClient.get(`${endpoint}/GetAll`)).data,
  getById: async (id) => (await apiClient.get(`${endpoint}/GetById/${id}`)).data,
  add: async (form) => (await apiClient.post(`${endpoint}/Add`, serializeTaskForm(form))).data,
  update: async (id, form) => (await apiClient.put(`${endpoint}/Update/${id}`, serializeTaskForm(form))).data,
  remove: async (id) => (await apiClient.delete(`${endpoint}/Delete/${id}`)).data,
};
