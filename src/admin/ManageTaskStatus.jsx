import CrudResourcePage from '../common/CrudResourcePage';
export default function ManageTaskStatus() { return <CrudResourcePage title="Task Statuses" endpoint="/TaskStatus" idKey="taskStatusID" fields={[{ name: 'taskStatusName', label: 'Name', required: true, maxLength: 20 }, { name: 'taskStatusCssClass', label: 'CSS Class', required: true, maxLength: 100 }]} />; }
