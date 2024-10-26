import { Home,Settings, Megaphone, BookCopy, ScrollText, CopyCheck,LogOut } from "lucide-react";
import Sidebar, { SidebarItem } from "./components/Sidebar.jsx"
import Announcement from "./components/Announcement.jsx"
import HomePage from "./components/Homepage.jsx"
import { BrowserRouter as Router,Route,Routes } from "react-router-dom";
import "./icon.css";


function App() {

  return (
     <Router>
      <div className="flex">
        <Sidebar>
          {/* The route matches the path to the route in the routes tag wherein if it match, it will render the .jsx it store */}
          {/* in active - if the URL matches the location.pathname, it will make the button active. */}
          <SidebarItem icon={<Home size={20} />} text="Home" route="/" active={location.pathname === "/"}/>
          <SidebarItem icon={<Megaphone size={20} />} text="Announcements" route="/Announcements" active={location.pathname === "/Announcements"} />
          <SidebarItem icon={<BookCopy size={20} />} text="Modules" alert />
          <SidebarItem icon={<ScrollText size={20} />} text="Assessments" />
          <SidebarItem icon={<CopyCheck size={20} />} text="Grades" alert />
          <hr className="mt-sidebar-space" />
          <div className="mt-3">
            <SidebarItem icon={<Settings size={20} />} text="Settings" />
            <SidebarItem  icon={<LogOut size={20} style={{ color: 'red' }} />} text={<span style={{ color: 'red' }}>Logout</span>} />
          </div>
        </Sidebar>
        
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Anouncements" element={<Announcement />} />
          </Routes>
        </div>

      </div>
    </Router> 
  )
}

export default App