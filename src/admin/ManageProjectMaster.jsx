import CrudResourcePage from '../common/CrudResourcePage';
export default function ManageProjectMaster() { return <CrudResourcePage title="Project Master" endpoint="/ProjectMaster" idKey="projectId" actionRoutes fields={[{ name: 'projectTitle', label: 'Project Title', required: true, maxLength: 200 }, { name: 'description', label: 'Description', multiline: true }]} />; }

