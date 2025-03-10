// React and Router imports
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";

// Styles
import "./icon.css";

// Route Protection Components
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { RoleBasedRoute } from "./routes/RoleBasedRoute";
import { clearAuthData } from "./utils/auth";

// General Pages
import Home from "./pages/General/Home";
import Login from "./pages/General/Login";
import ForgotPassword from "./pages/General/ForgotPassword";
import ChangePassword from "./pages/General/ChangePassword";
import PasswordConfirm from "./pages/General/PasswordConfirm";
import VerifyCode from "./pages/General/VerifyCode";

// Enrollment Pages
import Enrollment from "./pages/Enrollment/Enrollment";
import NewEnrollment from "./pages/Enrollment/NewEnrollment";
import EnrollConfirm from "./pages/Enrollment/EnrollConfirm";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminEnrollment from "./pages/Admin/AdminEnrollment";
import AdminAnnouncements from "./pages/Admin/AdminAnnouncements";

// Teacher Pages
import Dashboard from "./pages/Teacher/Dashboard";
import Notifications from "./pages/Teacher/Notifications";
import NotificationDetails from "./pages/Teacher/NotificationDetails";
import CourseAnnouncements from "./pages/Teacher/CourseAnnouncements";
import AnnouncementDetails from "./pages/Teacher/AnnouncementDetails";
import CourseModules from "./pages/Teacher/CourseModules";

// Learner Pages
import LearnerDashboard from "./pages/Learner/Dashboard";
import LearnerCourseAnnouncements from "./pages/Learner/CourseAnnouncements";
import LearnerAnnouncementDetails from "./pages/Learner/AnnouncementDetails";
import LearnerNotifications from "./pages/Learner/Notifications";
import LearnerNotificationDetails from "./pages/Learner/NotificationDetails";
import LearnerCourseModules from "./pages/Learner/CourseModules";

// Error Pages
import Error404 from "./pages/Errors/Error404";
import Error403 from "./pages/Errors/Error403";


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

        {/* Protected Admin Routes */}
        <Route
          path="/Admin/*"
          element={
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Routes>
                <Route path="Dashboard" element={<AdminDashboard />} />
                <Route path="Courses" element={<AdminCourses />} />
                <Route path="Enrollments" element={<AdminEnrollment />} />
                <Route path="Announcements" element={<AdminAnnouncements />} />
                {/* Catch all unmatched routes under /Admin/ */}
                <Route path="*" element={<Error404 />} />
              </Routes>
            </RoleBasedRoute>
          }
        />

        {/* Protected Teacher Routes */}
        <Route
          path="/Teacher/*"
          element={
            <RoleBasedRoute allowedRoles={["teacher", "student_teacher"]}>
              {/* Nested teacher routes */}
              <Routes>
                <Route path="Dashboard" element={<Dashboard />} />
                <Route path="Notifications" element={<Notifications />} />
                <Route path="NotificationDetails/:id" element={<NotificationDetails />} />
                <Route path="CourseAnnouncements" element={<CourseAnnouncements />} />
                <Route path="CourseModules" element={<CourseModules />} />
                {/* Catch all unmatched routes under /Teacher/ */}
                <Route path="*" element={<Error404 />} />
              </Routes>
            </RoleBasedRoute>
          }
        />

        {/* Protected Learner Routes */}
        <Route
          path="/Learner/*"
          element={
            <RoleBasedRoute allowedRoles={["learner"]}>
              {/* Nested learner routes */}
              <Routes>
                <Route path="Dashboard" element={<LearnerDashboard />} />
                <Route path="CourseAnnouncements" element={<LearnerCourseAnnouncements />} />
                <Route path="AnnouncementDetails/:id" element={<LearnerAnnouncementDetails />} />
                <Route path="Notifications" element={<LearnerNotifications />} />
                <Route path="NotificationDetails/:id" element={<LearnerNotificationDetails />} />
                <Route path="CourseModules" element={<LearnerCourseModules />} />
                {/* Catch all unmatched routes under /Learner/ */}
                <Route path="*" element={<Error404 />} />
              </Routes>
            </RoleBasedRoute>
          }
        />

        {/* Error routes */}
        <Route path="/unauthorized" element={<Error403 />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
}

export default App;
