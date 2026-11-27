import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { getApiErrorMessage } from '../services/apiClient';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [division, setDivision] = useState('');
  const [batch, setBatch] = useState('');

  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('');
  const [areaOfExpertise, setAreaOfExpertise] = useState('');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};

    if (!fullName.trim()) tempErrors.fullName = 'Full name is required';
    
    if (!email) {
      tempErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords must match';
    }

    if (!mobileNumber) {
      tempErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobileNumber)) {
      tempErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }

    // Role specific validation
    if (role === 'student') {
      if (!enrollmentNumber.trim()) tempErrors.enrollmentNumber = 'Enrollment number is required';
      if (!department) tempErrors.department = 'Department is required';
      if (!semester) tempErrors.semester = 'Semester is required';
      if (!division.trim()) tempErrors.division = 'Division is required';
      if (!batch.trim()) tempErrors.batch = 'Batch is required';
    } else if (role === 'faculty') {
      if (!facultyId.trim()) tempErrors.facultyId = 'Faculty ID is required';
      if (!department) tempErrors.department = 'Department is required';
      if (!designation) tempErrors.designation = 'Designation is required';
      if (!areaOfExpertise.trim()) tempErrors.areaOfExpertise = 'Area of expertise is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.webp)$/i;
      if (!allowedExtensions.exec(file.name)) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: 'Only JPG, JPEG, PNG, and WEBP formats are allowed'
        }));
        setProfilePicture(null);
      } else {
        setProfilePicture(file);
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.profilePicture;
          return copy;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('Role', role === 'student' ? 'Student' : 'Faculty');
      formData.append('FullName', fullName.trim());
      formData.append('Email', email.trim());
      formData.append('Password', password);
      formData.append('MobileNumber', mobileNumber.trim());

      if (profilePicture) {
        formData.append('ProfilePicture', profilePicture);
      }

      if (role === 'student') {
        formData.append('EnrollmentNumber', enrollmentNumber.trim());
        formData.append('Department', department);
        formData.append('Semester', semester);
        formData.append('Division', division.trim());
        formData.append('Batch', batch.trim());
      } else {
        formData.append('FacultyId', facultyId.trim());
        formData.append('Department', department);
        formData.append('Designation', designation);
        formData.append('AreaOfExpertise', areaOfExpertise.trim());
      }

      const response = await authService.register(formData);
      if (response?.success) {
        setApiSuccess('Registration successful! Redirecting to login in 2 seconds...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setApiError(response?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Registration failed. Please check the information provided.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card register">
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
          </div>
          <h2 className="auth-title">Create Workspace Account</h2>
          <p className="auth-subtitle">Register to manage project roles and supervisions</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Register As</label>
            <select
              id="role"
              className="form-control"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setErrors({});
              }}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty Member</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.edu"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobileNumber">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                className="form-control"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="10 digit number"
              />
              {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profilePicture">Profile Picture (Optional)</label>
            <input
              type="file"
              id="profilePicture"
              className="form-control"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
            />
            {errors.profilePicture && <span className="error-text">{errors.profilePicture}</span>}
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <>
              <h4 style={{ margin: '20px 0 10px', color: '#0f172a' }}>Student Academic Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="enrollmentNumber">Enrollment Number</label>
                  <input
                    type="text"
                    id="enrollmentNumber"
                    className="form-control"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="Enrollment / Roll No"
                  />
                  {errors.enrollmentNumber && <span className="error-text">{errors.enrollmentNumber}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="department">Department</label>
                  <select
                    id="department"
                    className="form-control"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                  {errors.department && <span className="error-text">{errors.department}</span>}
                </div>
              </div>

              <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="semester">Semester</label>
                  <select
                    id="semester"
                    className="form-control"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>Semester {num}</option>
                    ))}
                  </select>
                  {errors.semester && <span className="error-text">{errors.semester}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="division">Division</label>
                  <input
                    type="text"
                    id="division"
                    className="form-control"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="e.g. A"
                  />
                  {errors.division && <span className="error-text">{errors.division}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="batch">Batch</label>
                  <input
                    type="text"
                    id="batch"
                    className="form-control"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. B1"
                  />
                  {errors.batch && <span className="error-text">{errors.batch}</span>}
                </div>
              </div>
            </>
          )}

          {/* Faculty Specific Fields */}
          {role === 'faculty' && (
            <>
              <h4 style={{ margin: '20px 0 10px', color: '#0f172a' }}>Faculty Professional Details</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="facultyId">Faculty ID</label>
                  <input
                    type="text"
                    id="facultyId"
                    className="form-control"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    placeholder="Faculty ID"
                  />
                  {errors.facultyId && <span className="error-text">{errors.facultyId}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="facultyDept">Department</label>
                  <select
                    id="facultyDept"
                    className="form-control"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                  {errors.department && <span className="error-text">{errors.department}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="designation">Designation</label>
                  <select
                    id="designation"
                    className="form-control"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  >
                    <option value="">Select Designation</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                  {errors.designation && <span className="error-text">{errors.designation}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="areaOfExpertise">Area of Expertise</label>
                  <input
                    type="text"
                    id="areaOfExpertise"
                    className="form-control"
                    value={areaOfExpertise}
                    onChange={(e) => setAreaOfExpertise(e.target.value)}
                    placeholder="e.g. ASP.NET, Web APIs"
                  />
                  {errors.areaOfExpertise && <span className="error-text">{errors.areaOfExpertise}</span>}
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '20px' }} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
          {apiSuccess && <p style={{ color: '#15803d', marginTop: '12px', fontWeight: 600 }}>{apiSuccess}</p>}
          {apiError && <p className="error-text" role="alert" style={{ marginTop: '12px' }}>{apiError}</p>}
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
