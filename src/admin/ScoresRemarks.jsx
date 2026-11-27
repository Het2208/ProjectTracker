import AdminLayout from './AdminLayout';
import ScoresPage from '../common/ScoresPage';

export default function ScoresRemarks() {
  return (
    <ScoresPage
      pageWrapper={({ children }) => <AdminLayout>{children}</AdminLayout>}
      homePath="/admin/dashboard"
      title="Scores & Remarks"
      breadcrumb="Scores & Remarks"
    />
  );
}
