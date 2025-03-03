import React, { useEffect } from "react"; // Import useEffect
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Enrollment from "./components/Enrollment.jsx";
import NewEnrollment from "./components/NewEnrollment.jsx";
import "./icon.css";
import StudentDashboard from "./components/StudentDashboard.jsx";
import Courses from "./components/Courses.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Notifications from "./components/Notifications.jsx";
import NotificationDetails from "./components/NotificationDetails.jsx";
import CourseAnnouncements from "./components/CourseAnnouncements.jsx";
import AnnouncementDetails from "./components/AnnouncementDetails.jsx";
import CourseModules from "./components/CourseModules.jsx";
import EnrollConfirm from "./components/EnrollConfirm.jsx";
import AdminUser from "./components/AdminUser.jsx";
import AdminModules from "./components/AdminModules.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ChangePassword from "./components/ChangePassword.jsx";
import PasswordConfirm from "./components/PasswordConfirm.jsx";
import AdminEnrollment from "./components/AdminEnrollment.jsx";

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
        <Route path="/AdminUser" element={<AdminUser />} />
        <Route path="/AdminModules" element={<AdminModules />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
        <Route path="/PasswordConfirm" element={<PasswordConfirm />} />
        <Route path="/AdminEnrollment" element={<AdminEnrollment />} />
      </Routes>
    </Router>
  );
}

export default App;
