import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar, { SidebarItem } from "./components/Sidebar.jsx";
import Announcement from "./components/StudentDashboard.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import "./icon.css";
import StudentDashboard from "./components/StudentDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
