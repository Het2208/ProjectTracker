import FacultyLayout from './FacultyLayout';
import ProjectMasterPage from '../common/ProjectMasterPage';

export default function ManageProjects() {
  return (
    <ProjectMasterPage
      layout={{
        pageWrapper: ({ children }) => <FacultyLayout>{children}</FacultyLayout>,
        homePath: '/faculty/dashboard',
      }}
      title="Project Catalog"
      breadcrumb="Projects"
      tableTitle="Project Catalog (SPM_ProjectMaster)"
      canManage={false}
    />
  );
}
