import CrudResourcePage from '../common/CrudResourcePage';
export default function ManageRoles() { return <CrudResourcePage title="Roles" endpoint="/Role" idKey="roleId" fields={[{ name: 'roleName', label: 'Role Name', required: true, maxLength: 50 }, { name: 'description', label: 'Description', multiline: true, maxLength: 250 }]} />; }
