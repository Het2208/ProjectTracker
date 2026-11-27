import CrudResourcePage from '../common/CrudResourcePage';
export default function ManageTaskPriority() { return <CrudResourcePage title="Task Priorities" endpoint="/TaskPriority" idKey="taskPriorityId" fields={[{ name: 'taskPriorityName', label: 'Name', required: true, maxLength: 20 }, { name: 'taskPriorityCssClass', label: 'CSS Class', required: true, maxLength: 20 }]} />; }
