import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/General/Home.jsx";
import Login from "./pages/General/Login.jsx";
import Enrollment from "./pages/Enrollment/Enrollment.jsx";
import NewEnrollment from "./pages/Enrollment/NewEnrollment.jsx";
import "./icon.css";
import StudentDashboard from "./pages/Learner/StudentDashboard.jsx";
// Updated path to match component's actual location
import Courses from "./components/Courses.jsx";
import Dashboard from "./pages/Teacher/Dashboard.jsx";
import Notifications from "./pages/Teacher/Notifications.jsx";
import NotificationDetails from "./pages/Teacher/NotificationDetails.jsx";
import CourseAnnouncements from "./pages/Teacher/CourseAnnouncements.jsx";
import AnnouncementDetails from "./pages/Teacher/AnnouncementDetails.jsx";
import CourseModules from "./pages/Teacher/CourseModules.jsx";
import EnrollConfirm from "./pages/Enrollment/EnrollConfirm.jsx";
import AdminUser from "./pages/Admin/AdminUser.jsx";
import AdminModules from "./pages/Admin/AdminModules.jsx";
import ForgotPassword from "./pages/General/ForgotPassword.jsx";
import ChangePassword from "./pages/General/ChangePassword.jsx";
import PasswordConfirm from "./pages/General/PasswordConfirm.jsx";
import VerifyCode from "./pages/General/VerifyCode.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminCourses from "./pages/Admin/AdminCourses.jsx";
import AdminEnrollment from "./pages/Admin/AdminEnrollment.jsx";
import AdminAnnouncements from "./pages/Admin/AdminAnnouncements.jsx";
import Error404 from "./pages/Errors/Error404.jsx"; // Updated import path
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import { clearAuthData } from "./utils/auth";
import LearnerCourseAnnouncements from "./pages/Learner/CourseAnnouncements.jsx";
import LearnerAnnouncementDetails from "./pages/Learner/AnnouncementDetails";
import LearnerDashboard from "./pages/Learner/Dashboard.jsx";
import LearnerNotifications from "./pages/Learner/Notifications.jsx";
import LearnerNotificationDetails from "./pages/Learner/NotificationDetails.jsx";
import LearnerCourseModules from "./pages/Learner/CourseModules.jsx";

function App() {
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  // Updated Logout component
  const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const handleLogout = async () => {
        try {
          // Add API logout call here if needed
          clearAuthData();
          navigate("/login", { replace: true });
        } catch (error) {
          console.error("Logout failed:", error);
          // Still clear local data and redirect even if API call fails
          clearAuthData();
          navigate("/login", { replace: true });
        }
      };

      handleLogout();
    }, [navigate]);

    return null;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes - accessible when not logged in */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/Enrollment"
          element={
            <PublicRoute>
              <Enrollment />
            </PublicRoute>
          }
        />
        <Route
          path="/Enrollment/New"
          element={
            <PublicRoute>
              <NewEnrollment />
            </PublicRoute>
          }
        />
        <Route
          path="/ForgotPassword"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/ChangePassword"
          element={
            <PublicRoute>
              <ChangePassword />
            </PublicRoute>
          }
        />
        <Route
          path="/PasswordConfirm"
          element={
            <PublicRoute>
              <PasswordConfirm />
            </PublicRoute>
          }
        />
        <Route
          path="/VerifyCode"
          element={
            <PublicRoute>
              <VerifyCode />
            </PublicRoute>
          }
        />
        <Route
          path="/EnrollConfirm"
          element={
            <PublicRoute>
              <EnrollConfirm />
            </PublicRoute>
          }
        />

        {/* Protected routes - only accessible when logged in */}
        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Teacher/Dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Courses"
          element={
            <ProtectedRoute>
              <AdminCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Enrollments"
          element={
            <ProtectedRoute>
              <AdminEnrollment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Admin/Announcements"
          element={
            <ProtectedRoute>
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Teacher/Notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Teacher/NotificationDetails/:id"
          element={
            <ProtectedRoute>
              <NotificationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Teacher/CourseAnnouncements"
          element={
            <ProtectedRoute>
              <CourseAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Learner/CourseAnnouncements"
          element={
            <ProtectedRoute>
              <LearnerCourseAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AnnouncementDetails/:id"
          element={
            <ProtectedRoute>
              <AnnouncementDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CourseModules"
          element={
            <ProtectedRoute>
              <CourseModules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Teacher/CourseModules"
          element={
            <ProtectedRoute>
              <CourseModules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Learner/AnnouncementDetails/:id"
          element={
            <ProtectedRoute>
              <LearnerAnnouncementDetails />
            </ProtectedRoute>
          }
        />

        {/* Learner Routes */}
        <Route
          path="/Learner/Dashboard"
          element={
            <ProtectedRoute>
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Learner/CourseAnnouncements"
          element={
            <ProtectedRoute>
              <LearnerCourseAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Learner/AnnouncementDetails/:id"
          element={
            <ProtectedRoute>
              <LearnerAnnouncementDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Learner/Notifications"
          element={
            <ProtectedRoute>
              <LearnerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Learner/NotificationDetails/:id"
          element={
            <ProtectedRoute>
              <LearnerNotificationDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Learner/CourseModules"
          element={
            <ProtectedRoute>
              <LearnerCourseModules />
            </ProtectedRoute>
          }
        />

        {/* Error routes */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;
