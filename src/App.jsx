import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CourseProvider } from "./contexts/CourseContext";
import { AppProvider } from "./contexts/AppContext";
import { NetworkProvider } from "./contexts/NetworkContext";  // Add this import
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { MaintenanceProvider, useMaintenance } from './contexts/MaintenanceContext';
import "./icon.css";

// Custom loading component for routes
const RouteLoadingSpinner = () => (
  <div className="h-screen flex items-center justify-center">
    <LoadingSpinner />
  </div>
);

// Group route imports by role/access level
const PublicPages = {
  Home: lazy(() => import("./pages/General/Home")),
  Login: lazy(() => import("./pages/General/Login")),
  ForgotPassword: lazy(() => import("./pages/General/ForgotPassword")),
  ChangePassword: lazy(() => import("./pages/General/ChangePassword")),
  PasswordConfirm: lazy(() => import("./pages/General/PasswordConfirm")),
  VerifyCode: lazy(() => import("./pages/General/VerifyCode")),
  Enrollment: lazy(() => import("./pages/Enrollment/Enrollment")),
  NewEnrollment: lazy(() => import("./pages/Enrollment/NewEnrollment")),
  EnrollConfirm: lazy(() => import("./pages/Enrollment/EnrollConfirm"))
};

const AdminPages = {
  Dashboard: lazy(() => import("./pages/Admin/AdminDashboard")),
  Courses: lazy(() => import("./pages/Admin/AdminCourses")),
  Enrollment: lazy(() => import("./pages/Admin/AdminEnrollment")),
  Announcements: lazy(() => import("./pages/Admin/AdminAnnouncements"))
};

const TeacherPages = {
  Dashboard: lazy(() => import("./pages/Teacher/TeacherDashboard")),
  Notifications: lazy(() => import("./pages/Teacher/TeacherNotifications")),
  NotificationDetails: lazy(() => import("./pages/Teacher/TeacherNotificationDetails")),
  CourseAnnouncements: lazy(() => import("./pages/Teacher/TeacherCourseAnnouncements")),
  AnnouncementDetails: lazy(() => import("./pages/Teacher/TeacherAnnouncementDetails")),
  CourseModules: lazy(() => import("./pages/Teacher/TeacherCourseModules")),
  CourseAssessment: lazy(() => import("./pages/Teacher/TeacherCourseAssessment")),
  AssessmentView: lazy(() => import("./pages/Teacher/TeacherAssessmentView")),
  StudentSubmissionView: lazy(() => import("./pages/Teacher/StudentSubmissionView"))
};

const LearnerPages = {
  Dashboard: lazy(() => import("./pages/Learner/LearnerDashboard")),
  CourseAnnouncements: lazy(() => import("./pages/Learner/LearnerCourseAnnouncements")),
  AnnouncementDetails: lazy(() => import("./pages/Learner/LearnerAnnouncementDetails")),
  Notifications: lazy(() => import("./pages/Learner/LearnerNotifications")),
  NotificationDetails: lazy(() => import("./pages/Learner/LearnerNotificationDetails")),
  CourseModules: lazy(() => import("./pages/Learner/LearnerCourseModules")),
  CourseAssessment: lazy(() => import("./pages/Learner/LearnerCourseAssessment")),
  AssessmentView: lazy(() => import("./pages/Learner/LearnerAssessmentView")),
  LearnerSubmission: lazy(() => import("./pages/Teacher/StudentSubmissionView"))
};

const ErrorPages = {
  Error404: lazy(() => import("./pages/Errors/Error404")),
  Error403: lazy(() => import("./pages/Errors/Error403"))
};

const MaintenanceMode = lazy(() => import('./pages/Maintenance/MaintenanceMode'));

const Profile = lazy(() => import("./pages/General/Profile"));

import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { RoleBasedRoute } from "./routes/RoleBasedRoute";

function AppRoutes() {
  const { isMaintenanceMode } = useMaintenance();

  if (isMaintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CourseProvider>
          <Suspense fallback={<RouteLoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><PublicPages.Login /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><PublicPages.Login /></PublicRoute>} />
              <Route path="/Enrollment">
                <Route index element={<PublicRoute><PublicPages.Enrollment /></PublicRoute>} />
                <Route path="New" element={<PublicRoute><PublicPages.NewEnrollment /></PublicRoute>} />
              </Route>
              <Route path="/ForgotPassword" element={<PublicRoute><PublicPages.ForgotPassword /></PublicRoute>} />
              <Route path="/ChangePassword" element={<PublicRoute><PublicPages.ChangePassword /></PublicRoute>} />
              <Route path="/PasswordConfirm" element={<PublicRoute><PublicPages.PasswordConfirm /></PublicRoute>} />
              <Route path="/VerifyCode" element={<PublicRoute><PublicPages.VerifyCode /></PublicRoute>} />
              <Route path="/EnrollConfirm" element={<PublicRoute><PublicPages.EnrollConfirm /></PublicRoute>} />

              {/* Auth Routes */}
              <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Role-Based Routes */}
              <Route path="/Admin/*" element={
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <Routes>
                    <Route path="Dashboard" element={<AdminPages.Dashboard />} />
                    <Route path="Courses" element={<AdminPages.Courses />} />
                    <Route path="Enrollments" element={<AdminPages.Enrollment />} />
                    <Route path="Announcements" element={<AdminPages.Announcements />} />
                    <Route path="*" element={<ErrorPages.Error404 />} />
                  </Routes>
                </RoleBasedRoute>
              } />

              <Route path="/Teacher/*" element={
                <RoleBasedRoute allowedRoles={["teacher", "student_teacher"]}>
                  <Routes>
                    <Route path="Dashboard" element={<TeacherPages.Dashboard />} />
                    <Route path="Notifications" element={<TeacherPages.Notifications />} />
                    <Route path="NotificationDetails/:id" element={<TeacherPages.NotificationDetails />} />
                    <Route path="CourseAnnouncements" element={<TeacherPages.CourseAnnouncements />} />
                    <Route path="AnnouncementDetails/:id" element={<TeacherPages.AnnouncementDetails />} />
                    <Route path="CourseModules" element={<TeacherPages.CourseModules />} />
                    <Route path="Assessment" element={<TeacherPages.CourseAssessment />} />
                    <Route path="Assessment/View/:id" element={<TeacherPages.AssessmentView />} />
                    <Route path="Assessment/Submission/:id" element={<TeacherPages.StudentSubmissionView />} />
                    <Route path="*" element={<ErrorPages.Error404 />} />
                  </Routes>
                </RoleBasedRoute>
              } />

              <Route path="/Learner/*" element={
                <RoleBasedRoute allowedRoles={["learner"]}>
                  <Routes>
                    <Route path="Dashboard" element={<LearnerPages.Dashboard />} />
                    <Route path="Assessment" element={<LearnerPages.CourseAssessment />} />
                    <Route path="CourseAnnouncements" element={<LearnerPages.CourseAnnouncements />} />
                    <Route path="AnnouncementDetails/:id" element={<LearnerPages.AnnouncementDetails />} />
                    <Route path="Notifications" element={<LearnerPages.Notifications />} />
                    <Route path="NotificationDetails/:id" element={<LearnerPages.NotificationDetails />} />
                    <Route path="CourseModules" element={<LearnerPages.CourseModules />} />
                    <Route path="Assessment/:id" element={<LearnerPages.CourseAssessment />} />
                    <Route path="Assessment/View/:id" element={<LearnerPages.AssessmentView />} />
                    <Route path="Assessment/Submission/:id" element={<LearnerPages.LearnerSubmission />} />
                    <Route path="*" element={<ErrorPages.Error404 />} />
                  </Routes>
                </RoleBasedRoute>
              } />

              {/* Error Routes */}
              <Route path="/unauthorized" element={<ErrorPages.Error403 />} />
              <Route path="*" element={<ErrorPages.Error404 />} />
            </Routes>
          </Suspense>
        </CourseProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <MaintenanceProvider>
          <NetworkProvider>    {/* Add NetworkProvider */}
            <AppProvider>      {/* Global state management */}
              <AuthProvider>    
                <CourseProvider>
                  <AppRoutes />  {/* All routes/components are children */}
                </CourseProvider>
              </AuthProvider>
            </AppProvider>
          </NetworkProvider>
        </MaintenanceProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
