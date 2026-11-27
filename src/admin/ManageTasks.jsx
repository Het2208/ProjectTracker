import AdminLayout from './AdminLayout';
import TaskManagerPage from '../common/TaskManagerPage';

export default function ManageTasks() {
  return (
    <TaskManagerPage
      layout={{
        pageWrapper: ({ children }) => <AdminLayout>{children}</AdminLayout>,
        homePath: '/admin/dashboard',
      }}
      tableTitle="Project Deliverables & Tasks (SPM_Task)"
    />
  );
}
