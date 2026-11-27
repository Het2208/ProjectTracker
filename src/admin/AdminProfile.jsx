import AdminLayout from './AdminLayout';
import Profile from '../common/Profile';

export default function AdminProfile() {
  return (
    <Profile
      layout={{
        pageWrapper: ({ children }) => <AdminLayout>{children}</AdminLayout>,
        homePath: '/admin/dashboard',
      }}
      roleLabel="Admin"
    />
  );
}
