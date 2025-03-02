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
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import TeacherNotifications from "./components/TeacherNotifications.jsx";
import Notifications from "./components/Notifications.jsx";
import NotificationPage from "./components/NotificationPage.jsx";
import TeacherCoursePage from "./components/TeacherCoursePage.jsx";
import AnnouncementPage from "./components/AnnouncementPage.jsx";
import TeacherModules from "./components/TeacherModules.jsx";
import EnrollConfirm from "./components/EnrollConfirm.jsx";
import AdminCourses from "./components/AdminCourses.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminAnnouncements from "./components/AdminAnnouncements.jsx";

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
        <Route path="/Login" element={<Login />} />
        <Route path="/Enrollment" element={<Enrollment />} />
        <Route path="/Enrollment/New" element={<NewEnrollment />} />
        <Route path="/Logout" element={<Logout />} />
        <Route path="/Student/Dashboard" element={<StudentDashboard />} />
        <Route path="/Teacher/Dashboard" element={<TeacherDashboard />} />
        <Route path="/Teacher/Notifications" element={<TeacherNotifications />} />
        <Route path="/Teacher/Courses" element={<TeacherCoursePage />} />
        <Route path="/Teacher/Modules" element={<TeacherModules />} />
        <Route path="/Notifications/:id" element={<NotificationPage />} />
        <Route path="/Teacher/Announcements/:id" element={<AnnouncementPage />} />
        <Route path="/EnrollConfirm" element={<EnrollConfirm />} />
        <Route path="/Admin/Courses" element={<AdminCourses />} />
        <Route path="/Admin/Dashboard" element={<AdminDashboard />} />
        <Route path="/Admin/Announcements" element={<AdminAnnouncements />} />
      </Routes>
    </Router>
  );
}

export default App;
