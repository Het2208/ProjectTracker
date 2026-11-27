import FacultyLayout from './FacultyLayout';
import Profile from '../common/Profile';

export default function FacultyProfile() {
  return (
    <Profile
      layout={{
        pageWrapper: ({ children }) => <FacultyLayout>{children}</FacultyLayout>,
        homePath: '/faculty/dashboard',
      }}
      roleLabel="Faculty"
    />
  );
}
