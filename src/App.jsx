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
import StudentDashboard from "./components/StudentDashboard.jsx";//
import Courses from "./components/Courses.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import TeacherNotification from "./components/TeacherNotification.jsx";
import Notifications from "./components/Notifications.jsx";
import NotificationPage from "./components/NotificationPage.jsx";
import TeacherCoursePage from "./components/TeacherCoursePage.jsx";
import AnnouncementPage from "./components/AnnouncementPage.jsx";
import TeacherModules from "./components/TeacherModules.jsx";
import EnrollConfirm from "./components/EnrollConfirm.jsx";
import AdminUser from "./components/AdminUser.jsx";
import AdminModules from "./components/AdminModules.jsx";

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
        <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/TeacherNotification" element={<TeacherNotification />} />
        <Route path="/NotificationPage/:id" element={<NotificationPage />} />
        <Route path="/TeacherCoursePage" element={<TeacherCoursePage />} />
        <Route path="/AnnouncementPage/:id" element={<AnnouncementPage />} />
        <Route path="/TeacherModules" element={<TeacherModules />} />
        <Route path="/EnrollConfirm" element={<EnrollConfirm />} />
        <Route path="/AdminModules" element={<AdminModules />} />
        <Route path="/AdminUser" element={<AdminUser />} />
      </Routes>
    </Router>
  );
}

export default App;
