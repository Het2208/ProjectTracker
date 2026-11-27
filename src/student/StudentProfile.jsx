import StudentLayout from './StudentLayout';
import Profile from '../common/Profile';

export default function StudentProfile() {
  return (
    <Profile
      layout={{
        pageWrapper: ({ children }) => <StudentLayout>{children}</StudentLayout>,
        homePath: '/student/dashboard',
      }}
      roleLabel="Student"
    />
  );
}
