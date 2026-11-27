import AdminManageUsers from './ManageUsers';

export default function ManageStudents() {
  return <AdminManageUsers fixedUserTypeName="Student" title="Manage Students" breadcrumb="Students" addLabel="Add Student" />;
}
