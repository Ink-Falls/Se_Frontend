import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar, { SidebarItem } from "./components/Sidebar.jsx";
import Announcement from "./components/Announcement.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import "./icon.css";

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Announcements" element={<Announcement />} />
        </Routes>
    </Router>
  );
}

export default App;
