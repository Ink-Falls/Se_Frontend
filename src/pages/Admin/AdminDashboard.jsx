import React, { useState, useEffect } from "react";
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
  const [isSearching, setIsSearching] = useState(false);
  const [allUsersData, setAllUsersData] = useState([]); // Add this new state

  // Add new state for sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

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

  // Add sorting function
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Replace the searchAndFilterUsers effect with this updated version
  useEffect(() => {
    const filterAndSortUsers = async () => {
      try {
        setIsSearching(true);

        // Fetch all users if we don't have them
        if (allUsersData.length === 0) {
          const result = await getAllUsers({ page: 1, limit: 99999 });
          if (result && Array.isArray(result.users)) {
            const enrichedUsers = enrichUserData(result.users);
            setAllUsersData(enrichedUsers);
          }
        }

        let results = [...allUsersData];

        // Apply search if query exists
        if (searchQuery) {
          results = results.filter((user) => {
            const fullName = `${user.first_name} ${user.middle_initial || ""} ${
              user.last_name
            }`.toLowerCase();
            const email = user.email?.toLowerCase() || "";
            const searchTerm = searchQuery.toLowerCase();
            return fullName.includes(searchTerm) || email.includes(searchTerm);
          });
        }

        // Apply role filter
        if (roleFilter !== "all") {
          results = results.filter(
            (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
          );
        }

        // Apply sorting
        if (sortConfig.key) {
          results.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            // Handle special cases like full name
            if (sortConfig.key === "name") {
              aVal = `${a.first_name} ${a.last_name}`;
              bVal = `${b.first_name} ${b.last_name}`;
            }

            // Convert to lowercase if string
            if (typeof aVal === "string") aVal = aVal.toLowerCase();
            if (typeof bVal === "string") bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
          });
        }

        // Update pagination details
        const totalFilteredItems = results.length;
        const totalFilteredPages = Math.ceil(totalFilteredItems / 10);

        // Slice the results for current page
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedResults = results.slice(startIndex, endIndex);

        setFilteredUsers(paginatedResults);
        setTotalUsers(totalFilteredItems);
        setTotalPages(totalFilteredPages);
      } catch (error) {
        console.error("Error in filtering and sorting:", error);
        setError("Failed to process users");
      } finally {
        setIsSearching(false);
      }
    };

    filterAndSortUsers();
  }, [searchQuery, roleFilter, currentPage, allUsersData, sortConfig]);

  useEffect(() => {
    const searchAndFilterUsers = async () => {
      try {
        setIsSearching(true);

        // If we don't have all users yet, fetch them
        if (allUsersData.length === 0) {
          const result = await getAllUsers({ page: 1, limit: 99999 });
          if (result && Array.isArray(result.users)) {
            const enrichedUsers = enrichUserData(result.users);
            setAllUsersData(enrichedUsers);
          }
        }

        let results = [...allUsersData];

        // Apply search if query exists
        if (searchQuery) {
          results = results.filter((user) => {
            const fullName = `${user.first_name} ${user.middle_initial || ""} ${
              user.last_name
            }`.toLowerCase();
            const email = user.email?.toLowerCase() || "";
            const searchTerm = searchQuery.toLowerCase();
            return fullName.includes(searchTerm) || email.includes(searchTerm);
          });
        }

        // Apply role filter
        if (roleFilter !== "all") {
          results = results.filter(
            (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
          );
        }

        // Update pagination details
        const totalFilteredItems = results.length;
        const totalFilteredPages = Math.ceil(totalFilteredItems / 10);

        // Slice the results for current page
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedResults = results.slice(startIndex, endIndex);

        setFilteredUsers(paginatedResults);
        setTotalUsers(totalFilteredItems);
        setTotalPages(totalFilteredPages);
      } catch (error) {
        console.error("Error in search:", error);
        setError("Failed to search users");
      } finally {
        setIsSearching(false);
      }
    };

    searchAndFilterUsers();
  }, [searchQuery, roleFilter, currentPage, allUsersData]);

  // Modify handleSearch to reset pagination
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Add this function to handle search cancellation
  const handleSearchCancel = () => {
    setSearchQuery("");
    setCurrentPage(1);
    if (allUsersData.length > 0) {
      const totalItems = allUsersData.length;
      const totalPagesCount = Math.ceil(totalItems / 10);
      setTotalPages(totalPagesCount);
      setTotalUsers(totalItems);
      setFilteredUsers(allUsersData.slice(0, 10));
    }
  };

  // Modify the fetchUsers effect to store all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);

        // Fetch all users if we don't have them
        if (allUsersData.length === 0) {
          const allUsersResult = await getAllUsers({ page: 1, limit: 99999 });
          if (allUsersResult && Array.isArray(allUsersResult.users)) {
            const enrichedUsers = enrichUserData(allUsersResult.users);
            setAllUsersData(enrichedUsers);
            setTotalUsers(enrichedUsers.length);
            setTotalPages(Math.ceil(enrichedUsers.length / 10));
          }
        }

        // Set current page data
        const startIndex = (currentPage - 1) * 10;
        const endIndex = startIndex + 10;
        setFilteredUsers(allUsersData.slice(startIndex, endIndex));
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, allUsersData.length]);

  const handleFilterChange = (filter) => {
    setRoleFilter(filter);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      setSuccessMessage(null);
      setError(null);

      // Delete users sequentially to avoid overloading the server
      for (const id of selectedIds) {
        await deleteUser(id);
        // Remove the deleted user from all relevant state immediately
        setUsers((prev) => prev.filter((user) => user.id !== id));
        setFilteredUsers((prev) => prev.filter((user) => user.id !== id));
        setAllUsersData((prev) => prev.filter((user) => user.id !== id));
      }

      // Refresh the complete data after all deletions
      await refreshUsers();
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

  const refreshUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both paginated data and complete data
      const [paginatedResult, allUsersResult] = await Promise.all([
        getAllUsers({ page: currentPage, limit: 10 }),
        getAllUsers({ page: 1, limit: 99999 }),
      ]);

      if (paginatedResult?.users) {
        const enrichedUsers = enrichUserData(paginatedResult.users);
        setUsers(enrichedUsers);
        setFilteredUsers(enrichedUsers);
        setTotalPages(paginatedResult.totalPages);
        setTotalUsers(paginatedResult.totalItems);
      }

      if (allUsersResult?.users) {
        const enrichedAllUsers = enrichUserData(allUsersResult.users);
        setAllUsersData(enrichedAllUsers);
      }

      // Update stats
      await fetchTotalCounts();
    } catch (error) {
      console.error("Error refreshing users:", error);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
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
              totalStudentTeachers={stats.totalStudentTeachers}
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
                onSearchCancel={handleSearchCancel} // Add this prop
                onSort={handleSort}
                sortConfig={sortConfig}
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
