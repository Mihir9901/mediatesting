import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './AppLayout';

// Auth Pages
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import ManagerLogin from './pages/auth/ManagerLogin';
import TeamHeadLogin from './pages/auth/TeamHeadLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import InternAttendanceCheck from './pages/InternAttendanceCheck';
import InternAttendanceDetails from './pages/InternAttendanceDetails';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
// import DepartmentManagement from './pages/admin/DepartmentManagement';
import ManagerManagement from './pages/admin/ManagerManagement';
// import UserManagement from './pages/admin/UserManagement';
import UploadEmployees from './pages/admin/UploadEmployees';
import AttendanceReport from './pages/admin/AttendanceReport';
import InternDetails from './pages/admin/InternDetails';
import TeamHeadManagement from './pages/admin/TeamHeadManagement';
import EditDailyAttendance from './pages/admin/EditDailyAttendance';
import LoginLogs from './pages/admin/LoginLogs';
import KHIAccountManagement from './pages/admin/KHIAccountManagement';
// import AuditLogs from './pages/admin/AuditLogs';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import MarkAttendance from './pages/manager/MarkAttendance';
import EmployeeList from './pages/manager/EmployeeList';
import TeamManagement from './pages/manager/TeamManagement';
import TeamDetails from './pages/manager/TeamDetails';
import ManagerKHIAccounts from './pages/manager/ManagerKHIAccounts';
import TeamHeadDashboard from './pages/teamhead/TeamHeadDashboard';
import ViewKHIAccounts from './pages/shared/ViewKHIAccounts';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Authentication Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          <Route path="/team-head-login" element={<TeamHeadLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/intern-attendance" element={<InternAttendanceCheck />} />
          <Route path="/intern-attendance/details" element={<InternAttendanceDetails />} />

          {/* Protected Routes with Layout */}
          <Route element={<AppLayout />}>
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* <Route 
              path="/admin/departments" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DepartmentManagement />
                </ProtectedRoute>
              } 
            /> */}
            <Route 
              path="/admin/managers" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <ManagerManagement />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin/team-heads"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <TeamHeadManagement />
                </ProtectedRoute>
              }
            />
            {/* <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } 
            /> */}
            <Route 
              path="/admin/upload" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UploadEmployees />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/interns" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <InternDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/report" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AttendanceReport />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin/edit-attendance"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <EditDailyAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/login-logs"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <LoginLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/khi-accounts"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <KHIAccountManagement />
                </ProtectedRoute>
              }
            />
            {/* <Route 
              path="/admin/audit-logs" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              } 
            /> */}

            {/* Manager/User Routes */}
            <Route 
              path="/manager" 
              element={
                <ProtectedRoute allowedRoles={['Manager', 'User']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/mark-attendance" 
              element={
                <ProtectedRoute allowedRoles={['Manager', 'User']}>
                  <MarkAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager/employees" 
              element={
                <ProtectedRoute allowedRoles={['Manager', 'User']}>
                  <EmployeeList />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/manager/teams"
              element={
                <ProtectedRoute allowedRoles={['Manager']} requireManagerAccount>
                  <TeamManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/teams/:teamId"
              element={
                <ProtectedRoute allowedRoles={['Manager']} requireManagerAccount>
                  <TeamDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/khi-accounts"
              element={
                <ProtectedRoute allowedRoles={['Manager']} requireManagerAccount>
                  <ManagerKHIAccounts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/team-head"
              element={
                <ProtectedRoute allowedRoles={['TeamHead']}>
                  <TeamHeadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-head/mark-attendance"
              element={
                <ProtectedRoute allowedRoles={['TeamHead']}>
                  <MarkAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-head/employees"
              element={
                <ProtectedRoute allowedRoles={['TeamHead']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-head/khi-accounts"
              element={
                <ProtectedRoute allowedRoles={['TeamHead']}>
                  <ViewKHIAccounts />
                </ProtectedRoute>
              }
            />
            
          </Route>

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
