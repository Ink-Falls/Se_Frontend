import React from "react";
import PictureCodeGenerator from "../Teacher/PictureCodeGenerator";
import withAuth from "../../hoc/withAuth";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { useNavigate } from "react-router-dom";
import { Book, Bell, Hash, Image } from "lucide-react";

function PictureCodeGeneratorPage() {
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
        <Header title="Picture Code Generator" />
        <MobileNavBar navItems={navItems} />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Picture Code Generator</h1>
          <p className="text-gray-600 mb-6">
            Generate picture sequences for young students in grades 1-3. This
            provides an accessible way for young students to log in without
            needing to type or remember text.
          </p>

          <div className="max-w-md mx-auto">
            <PictureCodeGenerator />
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Using Picture Codes:</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Generate a picture sequence for the young student</li>
              <li>Show them the exact sequence of pictures</li>
              <li>
                Help them navigate to the login page and select "Picture Login"
              </li>
              <li>Guide them to select the pictures in the correct order</li>
              <li>The pictures and sequence change each time for security</li>
            </ol>

            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-100">
              <h3 className="text-md font-semibold text-blue-800 mb-2">
                Teaching Tip
              </h3>
              <p className="text-sm text-blue-700">
                For very young students, you can create a visual reference card
                with their picture sequence. Keep it in their folder or notebook
                for easy access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PictureCodeGeneratorPage, [
  "admin",
  "teacher",
  "student_teacher",
]);
