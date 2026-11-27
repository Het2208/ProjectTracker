import AdminLayout from './AdminLayout';
import ProjectMasterPage from '../common/ProjectMasterPage';

export default function ManageProjects() {
  return (
    <ProjectMasterPage
      layout={{
        pageWrapper: ({ children }) => <AdminLayout>{children}</AdminLayout>,
        homePath: '/admin/dashboard',
      }}
      title="Manage Projects"
      breadcrumb="Projects"
      tableTitle="Project Catalog (SPM_ProjectMaster)"
      canManage
    />
  );
}
