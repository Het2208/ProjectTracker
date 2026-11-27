import FacultyLayout from './FacultyLayout';
import TaskManagerPage from '../common/TaskManagerPage';

export default function ManageTasks() {
  return (
    <TaskManagerPage
      layout={{
        pageWrapper: ({ children }) => <FacultyLayout>{children}</FacultyLayout>,
        homePath: '/faculty/dashboard',
      }}
      tableTitle="Supervised Tasks Registry (SPM_Task)"
    />
  );
}
