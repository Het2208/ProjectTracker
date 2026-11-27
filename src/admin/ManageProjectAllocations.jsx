import AdminLayout from './AdminLayout';
import AllocationManagerPage from '../common/AllocationManagerPage';

export default function ManageProjectAllocations() {
  return (
    <AllocationManagerPage
      layout={{
        pageWrapper: ({ children }) => <AdminLayout>{children}</AdminLayout>,
        homePath: '/admin/dashboard',
      }}
      title="Project Allocations"
      breadcrumb="Project Allocations"
      tableTitle="Allocated Projects (SPM_ProjectAllocation)"
      canManage
    />
  );
}
