import FacultyLayout from './FacultyLayout';
import AllocationManagerPage from '../common/AllocationManagerPage';

export default function ProjectAllocations() {
  return (
    <AllocationManagerPage
      layout={{
        pageWrapper: ({ children }) => <FacultyLayout>{children}</FacultyLayout>,
        homePath: '/faculty/dashboard',
      }}
      title="Project Allocations"
      breadcrumb="Project Allocations"
      tableTitle="Allocated Projects (SPM_ProjectAllocation)"
      canManage
    />
  );
}
