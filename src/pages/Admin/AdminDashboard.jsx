import React, { useState, useEffect } from "react";
import Sidebar, {
  SidebarItem,
} from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import Modal from "../../components/common/Button/Modal";
import DeleteModal from "/src/components/common/Modals/Delete/DeleteModal.jsx";
import AddUserModal from "/src/components/common/Modals/Add/AddUserModal.jsx";
import CreateGroupModal from "/src/components/common/Modals/Create/CreateGroupModal.jsx";
import EditUserModal from "/src/components/common/Modals/Edit/EditUserModal.jsx";
import GroupDetailsModal from "../../components/common/Modals/View/GroupDetailsModal";
import {
  MoreVertical,
  ChevronDown,
  Edit,
  Trash2,
  Plus,
  Save,
  XCircle,
  Home,
  Book,
  Bell,
  FileText,
  Users,
  Search,
  InboxIcon,
  AlertTriangle,
} from "lucide-react";
import UserStats from "/src/components/specific/users/UserStats.jsx";
import UserTable from "/src/components/specific/users/UserTable.jsx";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "/src/services/userService.js";
import { generateUsersReport } from "../../services/reportService";
import ReportViewerModal from "../../components/common/Modals/View/ReportViewerModal";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { getAllCourses } from "/src/services/courseService.js";
import { getGroupsByType } from "/src/services/groupService.js";

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]); //for dropdown
  const [studentTeacherGroups, setStudentTeacherGroups] = useState([]); //for dropdown
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    //for add
    name: "",
    description: "",
    user_id: "", // Teacher ID,
    learner_group_id: "",
    student_teacher_group_id: "",
    image: "",
  });
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLearners: 0,
    totalTeachers: 0,
    totalAdmins: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [isGroupListModalOpen, setIsGroupListModalOpen] = useState(false);
  const [error, setError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUrl, setReportUrl] = useState(null);
  const [reportError, setReportError] = useState(null);

  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".menu-btn")
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const navItems = [
    { text: "Users", icon: <Home size={20} />, route: "/Admin/Dashboard" },
    { text: "Courses", icon: <Book size={20} />, route: "/Admin/Courses" },
    {
      text: "Enrollments",
      icon: <Bell size={20} />,
      route: "/Admin/Enrollments",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/Admin/Announcements",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [
          coursesData,
          teachersData,
          learnerGroupsData,
          studentTeacherGroupsData,
        ] = await Promise.all([
          getAllCourses(),
          getAllUsers({ page: 1, limit: 0 }), // Get all teachers
          getGroupsByType("learner"),
          getGroupsByType("student_teacher"),
        ]);

        setCourses(coursesData);

        // Filter teachers from users data
        if (teachersData && Array.isArray(teachersData.users)) {
          const filteredTeachers = teachersData.users.filter(
            (user) => user.role === "teacher"
          );
          setTeachers(filteredTeachers);
        }

        // Set learner groups
        if (Array.isArray(learnerGroupsData)) {
          setLearnerGroups(learnerGroupsData);
        } else {
          console.error("Invalid learner groups data:", learnerGroupsData);
          setLearnerGroups([]);
        }

        // Set student teacher groups
        if (Array.isArray(studentTeacherGroupsData)) {
          setStudentTeacherGroups(studentTeacherGroupsData);
        } else {
          console.error(
            "Invalid student teacher groups data:",
            studentTeacherGroupsData
          );
          setStudentTeacherGroups([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add cache-related state
  const [cache, setCache] = useState({});
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const checkCache = (key) => {
    const cached = cache[key];
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      const newCache = { ...cache };
      delete newCache[key];
      setCache(newCache);
      return null;
    }
    return cached.data;
  };

  const updateCache = (key, data) => {
    setCache((prev) => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
      },
    }));
  };

  const getSchoolName = (schoolId) => {
    const schools = {
      1001: "Asuncion Consunji Elementary School (ACES)",
      1002: "University of Santo Tomas (UST)",
    };
    return schools[schoolId] || "N/A";
  };

  // Modify the users data to include school name
  const enrichUserData = (users) => {
    return users.map((user) => ({
      ...user,
      school_name: getSchoolName(user.school_id),
    }));
  };

  // Modified fetchTotalCounts to be more robust
  const fetchTotalCounts = async () => {
    try {
      // Fetch all users without pagination to get accurate counts
      const result = await getAllUsers({
        page: 1,
        limit: 0, // Large number to get all users
      });

      if (result) {
        const roleCounts = result.roleCounts || [];
        const totalUsers = result.totalItems; // Total users from API
        const totalLearners = roleCounts.find(role => role.role === 'learner')?.count || 0;
        const totalTeachers = roleCounts
        .filter(role => role.role === 'teacher' || role.role === 'student_teacher')
        .reduce((sum, role) => sum + Number(role.count), 0);
        const totalAdmins = roleCounts.find(role => role.role === 'admin')?.count || 0;
      
        setStats({
          totalUsers,
          totalLearners,
          totalTeachers,
          totalAdmins
        });
      }
    } catch (error) {
      console.error("Error fetching total counts:", error);
    }
  };

  // Modified main users fetch effect to not update stats
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const cacheKey = `users_page_${currentPage}`;
        const cachedData = checkCache(cacheKey);

        if (cachedData) {
          setUsers(cachedData.users);
          setFilteredUsers(cachedData.users);
          setTotalPages(cachedData.totalPages);
          setTotalUsers(cachedData.totalItems);
          return;
        }

        setIsLoading(true);

        // Only fetch paginated data for the table
        const result = await getAllUsers({
          page: currentPage,
          limit: 10,
        });

        if (result && Array.isArray(result.users)) {
          const enrichedUsers = enrichUserData(result.users);
          updateCache(cacheKey, {
            users: enrichedUsers,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
          });

          setUsers(enrichedUsers);
          setFilteredUsers(enrichedUsers);
          setTotalPages(result.totalPages);
          setTotalUsers(result.totalItems);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Add effect to fetch stats on initial load
  useEffect(() => {
    fetchTotalCounts();
  }, []);

  useEffect(() => {
    // Filter users based on both search query and role
    let filteredResults = [...users];

    // Apply role filter first
    if (roleFilter !== "all") {
      filteredResults = filteredResults.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Then apply search filter
    if (searchQuery) {
      filteredResults = filteredResults.filter((user) => {
        const fullName = `${user.first_name} ${user.middle_initial || ""} ${
          user.last_name
        }`.toLowerCase();
        const email = user.email?.toLowerCase() || "";
        const searchTerm = searchQuery.toLowerCase();

        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
    }

    setFilteredUsers(filteredResults);
  }, [searchQuery, users, roleFilter]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter) => {
    setRoleFilter(filter);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedIds.map((id) => deleteUser(id)));
      await refreshUsers();
      setSelectedIds([]);
      setShowDeleteModal(false);
      setSuccessMessage("Successfully deleted user");
    } catch (error) {
      console.error("Error deleting users:", error);
      setError(error.message || "Failed to delete users");
    }
  };

  const handleCreateGroup = (groupData) => {
    setIsCreateGroupModalOpen(false);
  };

  // Modify refreshUsers to update both table and stats
  const refreshUsers = async () => {
    try {
      setIsLoading(true);

      // Fetch current page data for table
      const response = await getAllUsers({
        page: currentPage,
        limit: 10,
      });

      const usersArray = response.users || response.rows || [];
      const totalItems = response.totalItems || response.count || 0;
      const totalPagesCount = response.totalPages || Math.ceil(totalItems / 10);

      const enrichedUsers = enrichUserData(usersArray);
      setUsers(enrichedUsers);
      setFilteredUsers(enrichedUsers);
      setTotalPages(totalPagesCount);
      setTotalUsers(totalItems);

      // Update stats separately
      await fetchTotalCounts();
    } catch (error) {
      console.error("❌ Error refreshing users:", error);
      setError("Failed to refresh users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCreated = async (newUser) => {
    try {
      setCache({}); // Clear all cache
      await refreshUsers();
      setIsAddModalOpen(false);
      setSuccessMessage("Successfully added user");
    } catch (error) {
      console.error("Error handling new user:", error);
      setError("Failed to refresh user data after adding");
    }
  };

  const handleEditUser = async (user) => {
    try {
      // Add this to handle opening the modal
      setSelectedUser(user);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message || "Failed to update user");
    }
  };

  // Add handleSaveUser function
  const handleSaveUser = async (updatedUser) => {
    try {
      const { password, ...userWithoutPassword } = updatedUser;
      await updateUser(updatedUser.id, userWithoutPassword);
      await refreshUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setSuccessMessage("Successfully edited user");
    } catch (error) {
      console.error("Error saving user:", error);
      setError(error.message || "Failed to save user");
    }
  };

  const handleShowGroupList = () => {
    setIsGroupListModalOpen(true);
  };

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setError(null);
      setReportError(null);

      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem("user")) || {};

      const doc = await generateUsersReport(currentUser);
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setReportUrl(pdfUrl);
      setShowReportModal(true);
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate users report");
      setReportError("Failed to generate users report");
      setShowReportModal(true);
    }
  };

  const handleCloseReport = () => {
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
    }
    setReportUrl(null);
    setReportError(null);
    setShowReportModal(false);
  };

  const handlePrintReport = () => {
    if (reportUrl) {
      window.open(reportUrl, "_blank");
    }
  };

  const handleDeleteReport = () => {
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
      setReportUrl(null);
      setShowReportModal(false);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <InboxIcon size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Users Found
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-4">
        There are currently no users in the system. Add users by clicking the
        "Add User" button.
      </p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <AlertTriangle size={64} className="text-red-500 mb-4" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        Failed to Load Users
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        We encountered an error while trying to fetch the user data. This could
        be due to network issues or server unavailability.
      </p>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 flex items-center gap-2"
        >
          Refresh Page
        </button>
        <span className="text-sm text-gray-500 mt-2">
          You can try refreshing the page or contact support if the issue
          persists
        </span>
      </div>
    </div>
  );

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <>
      <div className="flex h-screen bg-gray-100 pb-8">
        {" "}
        {/* Added pb-16 */}
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6 overflow-auto pb-16">
          {" "}
          {/* Added pb-16 */}
          <Header title="Users" />
          {/* Add success message display */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {/* Loading skeleton for UserStats */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-lg shadow animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded-full w-20 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                </div>
              ))}
            </div>
          )}
          {/* Real UserStats when not loading */}
          {!isLoading && (
            <UserStats
              totalUsers={stats.totalUsers}
              totalLearners={stats.totalLearners}
              totalTeachers={stats.totalTeachers}
              totalAdmins={stats.totalAdmins}
            />
          )}
          <div className="bg-white shadow rounded-lg p-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded-full w-1/4 animate-pulse"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <ErrorState />
            ) : users.length === 0 ? (
              <EmptyState />
            ) : (
              <UserTable
                users={filteredUsers} // Pass filtered users instead of all users
                onEdit={handleEditUser} // Updated to use handleEditUser
                onAddUser={() => setIsAddModalOpen(true)}
                onDelete={() => setShowDeleteModal(true)}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onSearch={handleSearch} // Pass search handler
                onCreateGroup={() => setIsCreateGroupModalOpen(true)}
                onShowGroupList={handleShowGroupList}
                onFilterChange={handleFilterChange} // Add this prop
                currentFilter={roleFilter} // Add this prop
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onGenerateReport={handleGenerateReport}
              />
            )}
          </div>
        </div>
      </div>
      <MobileNavBar navItems={navItems} />
      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleUserCreated}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteSelected}
          message={`Are you sure you want to delete ${
            selectedIds.length
          } selected user${selectedIds.length > 1 ? "s" : ""}?`}
        />
      )}

      {isCreateGroupModalOpen && (
        <CreateGroupModal
          onClose={() => setIsCreateGroupModalOpen(false)}
          onSave={handleCreateGroup}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {isGroupListModalOpen && (
        <GroupDetailsModal onClose={() => setIsGroupListModalOpen(false)} />
      )}

      <ReportViewerModal
        isOpen={showReportModal}
        onClose={handleCloseReport}
        pdfUrl={reportUrl}
        onPrint={handlePrintReport}
        onDelete={handleDeleteReport}
        error={reportError}
        title="Users Report"
      />
    </>
  );
}

export default AdminDashboard;
