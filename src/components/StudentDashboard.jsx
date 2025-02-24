import React, { useEffect, useState } from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Home, Bell, Book, FileText } from "lucide-react";
import Header from "./Header";
import UserStats from "./UserStats";
import UserTable from "./UserTable";

const StudentDashboard = () => {
  const navItems = [
    { text: "Users", icon: <Home size={20} />, route: "/StudentDashboard" },
    { text: "Courses", icon: <Book size={20} />, route: "/Courses" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/notifications",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/announcements",
    },
  ];

  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalLearners: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalGroups: 0,
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch("/api/userStats");
        const data = await response.json();
        setUserStats({
          totalUsers: data.totalUsers || 0,
          totalLearners: data.totalLearners || 0,
          totalTeachers: data.totalTeachers || 0,
          totalAdmins: data.totalAdmins || 0,
          totalGroups: data.totalGroups || 0,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar>
        {navItems.map((item) => (
          <SidebarItem
            key={item.text}
            icon={item.icon}
            text={item.text}
            route={item.route}
            active={window.location.pathname === item.route}
          />
        ))}
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Pass the title prop to Header */}
        <Header title="Users" />
        <UserStats
          totalUsers={userStats.totalUsers}
          totalLearners={userStats.totalLearners}
          totalTeachers={userStats.totalTeachers}
          totalAdmins={userStats.totalAdmins}
          totalGroups={userStats.totalGroups}
        />
        <UserTable />
        <Outlet /> {/* Include Outlet for nested routes */}
      </div>
    </div>
  );
};

export default StudentDashboard;
