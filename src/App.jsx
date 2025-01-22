import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar, { SidebarItem } from "./components/Sidebar.jsx";
// import Announcement from "./components/StudentDashboard.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Enrollment from './components/Enrollment.jsx';
import NewEnrollment from './components/NewEnrollment.jsx';
import "./icon.css";
import StudentDashboard from "./components/StudentDashboard.jsx";

function App() {
  return (
    <Router>

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Enrollment" element={<Enrollment />} />
          <Route path="/Enrollment/New" element={<NewEnrollment />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Announcements" element={<Announcement />} />
          <Route path="/StudentDashboard" element={<StudentDashboard />} />
        </Routes>

    </Router>
  );
}

export default App;
