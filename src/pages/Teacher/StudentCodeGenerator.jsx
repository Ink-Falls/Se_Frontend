import React from "react";
import NumericCodeGenerator from "../Teacher/NumericCodeGenerator";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";
import { Book, Bell, Hash, Image } from "lucide-react";

function StudentCodeGenerator() {
  const navigate = useNavigate();

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
        <Header title="Learner Numeric Code Generator" />
        <MobileNavBar navItems={navItems} />

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Generate login codes for learners in grades 4-6. Learners can use
            these codes to log in without needing to remember passwords.
          </p>

          <div className="max-w-md mx-auto">
            <NumericCodeGenerator />
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">
              Instructions for Learner Login:
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Generate a code for the learner using their email address</li>
              <li>Share the 6-digit code or QR code with the learner</li>
              <li>Direct the learner to the login page</li>
              <li>
                The learner can enter the code or scan the QR code to log in
              </li>
              <li>Codes expire after 15 minutes for security</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentCodeGenerator;
