import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import tokenService from './services/tokenService';
import "./icon.css";

// Lazy load route components
const Home = lazy(() => import("./pages/General/Home"));
const Login = lazy(() => import("./pages/General/Login"));
const ForgotPassword = lazy(() => import("./pages/General/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/General/ChangePassword"));
const PasswordConfirm = lazy(() => import("./pages/General/PasswordConfirm"));
const Profile = lazy(() => import("./pages/General/Profile"));
const VerifyCode = lazy(() => import("./pages/General/VerifyCode"));
const Enrollment = lazy(() => import("./pages/Enrollment/Enrollment"));
const NewEnrollment = lazy(() => import("./pages/Enrollment/NewEnrollment"));
const EnrollConfirm = lazy(() => import("./pages/Enrollment/EnrollConfirm"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminCourses = lazy(() => import("./pages/Admin/AdminCourses"));
const AdminEnrollment = lazy(() => import("./pages/Admin/AdminEnrollment"));
const AdminAnnouncements = lazy(() => import("./pages/Admin/AdminAnnouncements"));
const TeacherDashboard = lazy(() => import("./pages/Teacher/TeacherDashboard"));
const TeacherNotifications = lazy(() => import("./pages/Teacher/TeacherNotifications"));
const TeacherNotificationDetails = lazy(() => import("./pages/Teacher/TeacherNotificationDetails"));
const TeacherCourseAnnouncements = lazy(() => import("./pages/Teacher/TeacherCourseAnnouncements"));
const TeacherAnnouncementDetails = lazy(() => import("./pages/Teacher/TeacherAnnouncementDetails"));
const TeacherCourseModules = lazy(() => import("./pages/Teacher/TeacherCourseModules"));
const TeacherCourseAssessment = lazy(() => import("./pages/Teacher/TeacherCourseAssessment"));
const LearnerDashboard = lazy(() => import("./pages/Learner/LearnerDashboard"));
const LearnerCourseAnnouncements = lazy(() => import("./pages/Learner/LearnerCourseAnnouncements"));
const LearnerAnnouncementDetails = lazy(() => import("./pages/Learner/LearnerAnnouncementDetails"));
const LearnerNotifications = lazy(() => import("./pages/Learner/LearnerNotifications"));
const LearnerNotificationDetails = lazy(() => import("./pages/Learner/LearnerNotificationDetails"));
const LearnerCourseModules = lazy(() => import("./pages/Learner/LearnerCourseModules"));
const LearnerCourseAssessment = lazy(() => import("./pages/Learner/LearnerCourseAssessment"));
const Error404 = lazy(() => import("./pages/Errors/Error404"));
const Error403 = lazy(() => import("./pages/Errors/Error403"));
const TestComponents = lazy(() => import("./components/test/TestComponents"));

import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { RoleBasedRoute } from "./routes/RoleBasedRoute";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Add this new route near the top of your routes */}
              <Route path="/test" element={<TestComponents />} />

              {/* Group routes logically */}
              
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/Enrollment" element={<PublicRoute><Enrollment /></PublicRoute>} />
              <Route path="/Enrollment/New" element={<PublicRoute><NewEnrollment /></PublicRoute>} />
              <Route path="/ForgotPassword" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/ChangePassword" element={<PublicRoute><ChangePassword /></PublicRoute>} />
              <Route path="/PasswordConfirm" element={<PublicRoute><PasswordConfirm /></PublicRoute>} />
              <Route path="/VerifyCode" element={<PublicRoute><VerifyCode /></PublicRoute>} />
              <Route path="/EnrollConfirm" element={<PublicRoute><EnrollConfirm /></PublicRoute>} />

              {/* Auth Protected Routes */}
              <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/Admin/*" element={
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <Routes>
                    <Route path="Dashboard" element={<AdminDashboard />} />
                    <Route path="Courses" element={<AdminCourses />} />
                    <Route path="Enrollments" element={<AdminEnrollment />} />
                    <Route path="Announcements" element={<AdminAnnouncements />} />
                    <Route path="*" element={<Error404 />} />
                  </Routes>
                </RoleBasedRoute>
              } />

              {/* Teacher Routes */} 
              <Route path="/Teacher/*" element={
                <RoleBasedRoute allowedRoles={["teacher", "student_teacher"]}>
                  <Routes>
                    <Route path="Dashboard" element={<TeacherDashboard />} />
                    <Route path="Notifications" element={<TeacherNotifications />} />
                    <Route path="NotificationDetails/:id" element={<TeacherNotificationDetails />} />
                    <Route path="CourseAnnouncements" element={<TeacherCourseAnnouncements />} />
                    <Route path="AnnouncementDetails/:id" element={<TeacherAnnouncementDetails />} />
                    <Route path="CourseModules" element={<TeacherCourseModules />} />
                    <Route path="Assessment" element={<TeacherCourseAssessment />} />
                    <Route path="*" element={<Error404 />} />
                  </Routes>
                </RoleBasedRoute>
              } />

              {/* Learner Routes */}
              <Route path="/Learner/*" element={
                <RoleBasedRoute allowedRoles={["learner"]}>
                  <Routes>
                    <Route path="Dashboard" element={<LearnerDashboard />} />
                    <Route path="Assessment" element={<LearnerCourseAssessment />} />
                    <Route path="CourseAnnouncements" element={<LearnerCourseAnnouncements />} />
                    <Route path="AnnouncementDetails/:id" element={<LearnerAnnouncementDetails />} />
                    <Route path="Notifications" element={<LearnerNotifications />} />
                    <Route path="NotificationDetails/:id" element={<LearnerNotificationDetails />} />
                    <Route path="CourseModules" element={<LearnerCourseModules />} />
                    <Route path="*" element={<Error404 />} />
                  </Routes>
                </RoleBasedRoute>
              } />

              {/* Error Routes */}
              <Route path="/unauthorized" element={<Error403 />} />
              <Route path="*" element={<Error404 />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
