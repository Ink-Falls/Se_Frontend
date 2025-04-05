import React, { useState, useEffect } from "react";
import { Home, Megaphone, BookOpen, ClipboardList, User, LineChart, FileText } from "lucide-react";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useCourse } from "../../contexts/CourseContext";

const TeacherProgressTracker = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const { selectedCourse: contextCourse } = useCourse();

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Announcements",
      icon: <Megaphone size={20} />,
      route: "/Teacher/CourseAnnouncements",
    },
    {
      text: "Modules",
      icon: <BookOpen size={20} />,
      route: "/Teacher/CourseModules",
    },
    {
      text: "Assessments",
      icon: <ClipboardList size={20} />,
      route: "/Teacher/Assessment",
    },
    {
      text: "Attendance",
      icon: <User size={20} />,
      route: "/Teacher/Attendance",
    },
    {
      text: "Progress Tracker",
      icon: <LineChart size={20} />,
      route: "/Teacher/ProgressTracker",
    },
  ];

  // Updated mock data with more examples
  const mockStudents = [
    {
      id: 1,
      name: "John Doe",
      grade: 85,
      totalAbsences: 2,
      modules: {
        module1: 90,
        module2: 85,
        module3: 80,
      },
      lastActive: "2024-01-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      grade: 72,
      totalAbsences: 4,
      modules: {
        module1: 65,
        module2: 78,
        module3: 73,
      },
      lastActive: "2024-01-14",
    },
    {
      id: 3,
      name: "Alex Johnson",
      grade: 95,
      totalAbsences: 1,
      modules: {
        module1: 98,
        module2: 92,
        module3: 95,
      },
      lastActive: "2024-01-15",
    },
    {
      id: 4,
      name: "Maria Garcia",
      grade: 68,
      totalAbsences: 5,
      modules: {
        module1: 70,
        module2: 65,
        module3: 69,
      },
      lastActive: "2024-01-13",
    },
    {
      id: 5,
      name: "William Chen",
      grade: 88,
      totalAbsences: 0,
      modules: {
        module1: 85,
        module2: 90,
        module3: 89,
      },
      lastActive: "2024-01-15",
    },
  ];

  useEffect(() => {
    const fetchStudentProgress = async () => {
      if (!contextCourse?.id) return;

      try {
        setLoading(true);
        // Replace with actual API call
        setTimeout(() => {
          setStudents(mockStudents);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching student progress:", error);
        setLoading(false);
      }
    };

    fetchStudentProgress();
  }, [contextCourse]);

  const handleGenerateReport = () => {
    console.log("Generate report clicked");
    // Add logic for generating report
  };

  const getScoreStyle = (score) => {
    if (score >= 75) {
      return {
        className: "px-2 py-1 rounded font-medium text-green-700 bg-green-50 border border-green-600",
      };
    }
    return {
      className: "px-2 py-1 rounded font-medium text-yellow-600 bg-yellow-50 border border-yellow-500",
    };
  };

  const renderProgressTable = () => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Student Progress</h2>
        <button
          onClick={() => handleGenerateReport()}
          className="flex items-center gap-2 px-4 py-2 bg-[#212529] text-white rounded-lg text-sm transition duration-300 hover:bg-[#F6BA18] hover:text-black"
        >
          <FileText size={16} />
          <span>Generate Report</span>
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Learner Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Absences
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Module 1
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Module 2
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Module 3
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Active
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span {...getScoreStyle(student.grade)}>
                  {student.grade}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.totalAbsences}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span {...getScoreStyle(student.modules?.module1)}>
                  {student.modules?.module1 ?? 'N/A'}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span {...getScoreStyle(student.modules?.module2)}>
                  {student.modules?.module2 ?? 'N/A'}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span {...getScoreStyle(student.modules?.module3)}>
                  {student.modules?.module3 ?? 'N/A'}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.lastActive}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex flex-1 h-[calc(100vh-32px)]">
        <div className="hidden lg:flex">
          <Sidebar navItems={navItems} />
        </div>

        <div className="flex-1 p-6 max-md:p-5 overflow-y-auto">
          <Header title={`Progress Tracker - ${contextCourse?.name || ''}`} />

          {loading ? (
            <LoadingSpinner />
          ) : (
            /* Progress Table */
            renderProgressTable()
          )}
        </div>

        <MobileNavBar navItems={navItems} />
      </div>
    </div>
  );
};

export { TeacherProgressTracker };
export default TeacherProgressTracker;
