import React from "react";
import PictureCodeGenerator from "../Teacher/PictureCodeGenerator";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { Book, Bell, Hash, Image } from "lucide-react";

function PictureCodeGeneratorPage() {
  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Teacher/Notifications",
    },
    {
      text: "Number Codes (4-6)",
      icon: <Hash size={20} />,
      route: "/Teacher/StudentCodeGenerator",
    },
    {
      text: "Picture Codes (1-3)",
      icon: <Image size={20} />,
      route: "/Teacher/PictureCodeGenerator",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header title="Picture Code Generator" />
        <MobileNavBar navItems={navItems} />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Picture Code Generator</h1>
          <p className="text-gray-600 mb-6">
            Generate picture sequences for young learners (grades 1-3). Students
            can use these picture sequences to log in without needing to remember
            passwords.
          </p>

          <div className="max-w-md mx-auto">
            <PictureCodeGenerator />
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">
              Instructions for Student Picture Login:
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Generate a picture sequence for the student</li>
              <li>Show the picture sequence to the student</li>
              <li>Direct the student to the login page</li>
              <li>The student can select the pictures in the correct order</li>
              <li>Picture sequences expire after 15 minutes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PictureCodeGeneratorPage;
