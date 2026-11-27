import FacultyLayout from './FacultyLayout';
import ScoresPage from '../common/ScoresPage';

export default function TaskEvaluations() {
  return (
    <ScoresPage
      pageWrapper={({ children }) => <FacultyLayout>{children}</FacultyLayout>}
      homePath="/faculty/dashboard"
      title="Task Evaluations"
      breadcrumb="Task Evaluations"
    />
  );
}
