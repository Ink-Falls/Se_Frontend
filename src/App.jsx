import React, { useEffect } from "react"; // Import useEffect
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
import Courses from "./components/Courses.jsx";
import Dashboard from "./pages/General/Dashboard.jsx";
import Notifications from "./components/Notifications.jsx";
import NotificationDetails from "./components/NotificationDetails.jsx";
import CourseAnnouncements from "./components/CourseAnnouncements.jsx";
import AnnouncementDetails from "./components/AnnouncementDetails.jsx";
import CourseModules from "./components/CourseModules.jsx";
import EnrollConfirm from "./pages/Enrollment/EnrollConfirm.jsx";
import AdminUser from "./pages/Admin/AdminUser.jsx";
import AdminModules from "./pages/Admin/AdminModules.jsx";
import ForgotPassword from "./pages/General/ForgotPassword.jsx";
import ChangePassword from "./pages/General/ChangePassword.jsx";
import PasswordConfirm from "./pages/General/PasswordConfirm.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminCourses from "./pages/Admin/AdminCourses.jsx";
import AdminEnrollment from "./pages/Admin/AdminEnrollment.jsx";
import AdminAnnouncements from "./pages/Admin/AdminAnnouncements.jsx";

import StudentDashboard from "./pages/Learner/StudentDashboard.jsx";
import Assessments from "./pages/Learner/Assessments.jsx";

function App() {
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  // Inline Logout component
  const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
      // still not working
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }, [navigate]); // The dependency array was the issue!

    return null;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/Enrollment" element={<Enrollment />} />
        <Route path="/Enrollment/New" element={<NewEnrollment />} />

        <Route path="/logout" element={<Logout />} />

        <Route path="/Dashboard" element={<Dashboard />} />

        <Route path="/Admin/Dashboard" element={<AdminDashboard />} />
        <Route path="/Admin/Courses" element={<AdminCourses />} />
        <Route path="/Admin/Enrollments" element={<AdminEnrollment />} />
        <Route path="/Admin/Announcements" element={<AdminAnnouncements />} />
        
        <Route path="/Student/Dashboard" element={<StudentDashboard />} />
        <Route path="/Student/Assessments" element={<Assessments />} />


        <Route path="/Notifications" element={<Notifications />} />
        <Route
          path="/NotificationDetails/:id"
          element={<NotificationDetails />}
        />
        <Route path="/CourseAnnouncements" element={<CourseAnnouncements />} />
        <Route
          path="/AnnouncementDetails/:id"
          element={<AnnouncementDetails />}
        />
        <Route path="/CourseModules" element={<CourseModules />} />
        <Route path="/EnrollConfirm" element={<EnrollConfirm />} />
        {/* <Route path="/AdminUser" element={<AdminUser />} />
        <Route path="/AdminModules" element={<AdminModules />} /> */}
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="/PasswordConfirm" element={<PasswordConfirm />} />
        {/* <Route path="/AdminEnrollment" element={<AdminEnrollment />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
