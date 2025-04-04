import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import DeleteModal from "/src/components/common/Modals/Delete/DeleteModal.jsx";
import AddUserModal from "/src/components/common/Modals/Add/AddUserModal.jsx";
import CreateGroupModal from "/src/components/common/Modals/Create/CreateGroupModal.jsx";
import EditUserModal from "/src/components/common/Modals/Edit/EditUserModal.jsx";
import GroupDetailsModal from "../../components/common/Modals/View/GroupDetailsModal";
import {
  Home,
  Book,
  Bell,
  FileText,
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
  const [teachers, setTeachers] = useState([]);
  const [learnerGroups, setLearnerGroups] = useState([]); //for dropdown
  const [studentTeacherGroups, setStudentTeacherGroups] = useState([]); //for dropdown
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLearners: 0,
    totalTeachers: 0,
    totalStudentTeachers: 0,
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
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [allUsersData, setAllUsersData] = useState([]);

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

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await getAllUsers({ limit: 999999 });
        if (response && Array.isArray(response.users)) {
          const enrichedUsers = enrichUserData(response.users);
          setAllUsersData(enrichedUsers);
        }
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    };
    fetchAllUsers();
  }, []);

  const getSchoolName = (schoolId) => {
    const schools = {
      1001: "Asuncion Consunji Elementary School (ACES)",
      1002: "University of Santo Tomas (UST)",
    };
    return schools[schoolId] || "N/A";
  };

  const enrichUserData = (users) => {
    return users.map((user) => ({
      ...user,
      school_name: getSchoolName(user.school_id),
    }));
  };

  const fetchTotalCounts = async () => {
    try {
      const result = await getAllUsers({
        page: 1,
        limit: 0,
      });

      if (result) {
        const roleCounts = result.roleCounts || [];
        const totalUsers = result.totalItems;
        const totalLearners =
          roleCounts.find((role) => role.role === "learner")?.count || 0;
        const totalTeachers =
          roleCounts.find((role) => role.role === "teacher")?.count || 0;
        const totalStudentTeachers =
          roleCounts.find((role) => role.role === "student_teacher")?.count ||
          0;
        const totalAdmins =
          roleCounts.find((role) => role.role === "admin")?.count || 0;

        setStats({
          totalUsers,
          totalLearners,
          totalTeachers,
          totalStudentTeachers,
          totalAdmins,
        });
      }
    } catch (error) {
      console.error("Error fetching total counts:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getAllUsers({
          page: currentPage,
          limit: 10,
          role: roleFilter === "all" ? "" : roleFilter,
          sortBy: sortConfig.key,
          sortDirection: sortConfig.direction,
        });

        if (response && response.users) {
          const enrichedUsers = enrichUserData(response.users);
          setFilteredUsers(enrichedUsers);
          setTotalPages(response.totalPages);
          setTotalUsers(response.totalItems);
        }

        await fetchTotalCounts();
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    if (!searchQuery) {
      fetchUsers();
    }
  }, [currentPage, roleFilter, sortConfig]);

  const handleFilterChange = async (filter) => {
    setRoleFilter(filter);
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredUsers(allUsersData.slice(0, 10));
      setTotalPages(Math.ceil(allUsersData.length / 10));
      setTotalUsers(allUsersData.length);
      setCurrentPage(1);
    } else {
      const filtered = allUsersData.filter((user) => {
        const searchTerm = query.toLowerCase();
        const firstName = user.first_name.toLowerCase();
        const lastName = user.last_name.toLowerCase();
        const email = user.email.toLowerCase();
        const contact = user.contact_no;

        return (
          firstName.includes(searchTerm) ||
          lastName.includes(searchTerm) ||
          email.includes(searchTerm) ||
          contact.includes(searchTerm)
        );
      });

      setFilteredUsers(filtered.slice(0, 10));
      setTotalUsers(filtered.length);
      setTotalPages(Math.ceil(filtered.length / 10));
      setCurrentPage(1);
    }
  };

  const handleSearchCancel = () => {
    setSearchQuery("");
    setFilteredUsers(allUsersData.slice(0, 10));
    setTotalUsers(allUsersData.length);
    setTotalPages(Math.ceil(allUsersData.length / 10));
    setCurrentPage(1);
  };

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      setError(null);

      for (const id of selectedIds) {
        await deleteUser(id);
        setFilteredUsers((prev) => prev.filter((user) => user.id !== id));
      }

      setSelectedIds([]);
      setShowDeleteModal(false);
      setSuccessMessage(
        `Successfully deleted ${selectedIds.length} user${
          selectedIds.length > 1 ? "s" : ""
        }`
      );
    } catch (error) {
      console.error("Error deleting users:", error);
      setError(error.message || "Failed to delete users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = (groupData) => {
    setIsCreateGroupModalOpen(false);
  };

  const handleUserCreated = async (newUser) => {
    try {
      setIsAddModalOpen(false);
      setSuccessMessage("Successfully added user");
    } catch (error) {
      console.error("Error handling new user:", error);
      setError("Failed to refresh user data after adding");
    }
  };

  const handleEditUser = async (user) => {
    try {
      setSelectedUser(user);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message || "Failed to update user");
    }
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      const { password, ...userWithoutPassword } = updatedUser;
      const response = await updateUser(updatedUser.id, userWithoutPassword);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setSuccessMessage("Successfully edited user");
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
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
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6 overflow-auto pb-16">
          <Header title="Users" />
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          {!isLoading && <UserStats {...stats} />}
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
            ) : filteredUsers.length === 0 ? (
              <EmptyState />
            ) : (
              <UserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onAddUser={handleAddClick}
                onDelete={() => setShowDeleteModal(true)}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onSearch={handleSearch}
                onCreateGroup={() => setIsCreateGroupModalOpen(true)}
                onShowGroupList={handleShowGroupList}
                onFilterChange={handleFilterChange}
                currentFilter={roleFilter}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalUsers}
                onPageChange={handlePageChange}
                onGenerateReport={handleGenerateReport}
                onSearchCancel={handleSearchCancel}
                onSort={handleSort}
                sortConfig={sortConfig}
                searchQuery={searchQuery}
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
