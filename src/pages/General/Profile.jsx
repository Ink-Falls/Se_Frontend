import React, { useState, useEffect } from "react";
import { getUserById, updateUser } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import {
  Book,
  Bell,
  FileText,
  Home,
  PencilIcon,
  X,
  Check as CheckIcon,
} from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../services/authService"; // Import function
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { getUserProfileImage } from "../../utils/profileImages";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const getNavItems = (role) => {
  // Base items for admin
  const adminItems = [
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

  // Base items for teacher/student_teacher
  const teacherItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Teacher/Notifications",
    },
  ];

  // Base items for learner - Updated to match LearnerDashboard
  const learnerItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Learner/Notifications",
    },
  ];

  switch (role?.toLowerCase()) {
    case "admin":
      return adminItems;
    case "teacher":
    case "student_teacher":
      return teacherItems;
    case "learner":
      return learnerItems;
    default:
      return learnerItems; // Default to learner items
  }
};

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editError, setEditError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileImage] = useState(
    getUserProfileImage(JSON.parse(localStorage.getItem("user"))?.role)
  );
  const [editMessage, setEditMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        if (authLoading) return;

        // Check authentication
        if (!isAuthenticated) {
          navigate("/login");
          return;
        }

        // Get user from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const savedProfileImage = localStorage.getItem("userProfileImage");

        if (savedProfileImage) {
          setCurrentProfileImage(savedProfileImage);
        }

        if (!storedUser || !storedUser.id) {
          console.error("No user data in localStorage");
          setError("User data not found");
          return;
        }

        /*if (storedUser.role === "learner") { // Why different for learner?
          // For learners, use stored data
          setUser(storedUser);
        } else {*/
          try {
            // For teachers/admins, get fresh data
            const freshData = await getUserById(storedUser.id);
            setUser(freshData || storedUser); // Fallback to stored data if fetch fails
          } catch (err) {
            console.error("Failed to fetch fresh data:", err);
            // Fallback to stored data on error
            setUser(storedUser);
          }
      //}
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Load saved profile image
    const savedImageSrc = localStorage.getItem("userProfileImage");
    if (savedImageSrc) {
      setCurrentProfileImage(savedImageSrc);
    }
  }, [isAuthenticated, authLoading, navigate]);

  const getSchoolName = (schoolId) => {
    const schools = {
      1001: "University of Santo Tomas (UST)",
      1002: "Asuncion Consunji Elementary School (ACES)",
    };
    return schools[schoolId] || "N/A";
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill out all fields.");
      return;
    }

    const passwordPattern =
      /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      setMessage(
        "Password must have at least 8 characters, one digit, and one symbol."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    try {
      await changePassword(user.id, oldPassword, newPassword, confirmPassword);
      setMessage("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password change error:", err);
      setMessage(err.message || "Failed to change password. Please try again.");
    }
  };

  const handleEditClick = () => {
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      middle_initial: user.middle_initial || "",
      email: user.email,
      contact_no: user.contact_no || "",
      birth_date: user.birth_date
        ? new Date(user.birth_date).toISOString().split("T")[0]
        : "",
      school_id: user.school_id || "",
    });
    setIsEditMode(true);
  };

  const validateEmail = (email) => {
    // Array of common TLDs - add more as needed
    const validTLDs = ["com", "edu", "ph", "org", "net", "gov", "edu.ph"];

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Extract domain and check TLD
    const domain = email.split("@")[1];
    return validTLDs.some((tld) => domain.toLowerCase().endsWith(`.${tld}`));
  };

  const handleEditSubmit = async () => {
    try {
      setEditError("");
      setEditMessage({ type: "", text: "" });

      // Validate email format first
      if (!validateEmail(editFormData.email)) {
        setEditError("Please enter a valid email address");
        setEditMessage({
          type: "error",
          text: "Please enter a valid email address",
        });
        return;
      }

      const updatedUser = await updateUser(user.id, editFormData);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditMode(false);
      setEditMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setEditMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      console.error("Profile update error:", err);

      if (
        err.response?.status === 409 ||
        err.message.includes("already exists")
      ) {
        setEditMessage({
          type: "error",
          text: "This email address is already in use",
        });
      } else {
        setEditMessage({
          type: "error",
          text: err.message || "Failed to update profile",
        });
      }
    }
  };

  // Add email validation to handleInputChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when email is changed
    if (name === "email") {
      setEditError("");
    }
  };

  const renderProfilePicture = () => (
    <div className="relative">
      <img
        src={profileImage}
        alt="Profile"
        className="w-40 h-40 rounded-full border-4 border-white md:ml-8 object-contain bg-white"
      />
    </div>
  );

  // Add null check for user in render
  if (isLoading) {
    return <LoadingSpinner text="Loading Profile" />;
  }

  if (!user || loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Get nav items based on user role
  const navItems = getNavItems(user?.role);

  const renderEditModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-w-2xl relative">
        <button
          className="absolute top-2 right-3 text-3xl font-semibold text-gray-500 hover:text-gray-800"
          onClick={() => setIsEditMode(false)}
        >
          &times;
        </button>
        <h2 aria-label="edit_profile" className="text-xl font-semibold mb-4">
          Edit Profile
        </h2>

        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 text-green-600 rounded">
            {successMessage}
          </div>
        )}

        {editError && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {editError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={editFormData.first_name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, first_name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={editFormData.last_name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, last_name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Middle Initial
            </label>
            <input
              type="text"
              value={editFormData.middle_initial}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  middle_initial: e.target.value.toUpperCase(),
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="tel"
              value={editFormData.contact_no}
              onChange={(e) =>
                setEditFormData({ ...editFormData, contact_no: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
              placeholder="09XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Birth Date
            </label>
            <input
              type="date"
              value={editFormData.birth_date}
              onChange={(e) =>
                setEditFormData({ ...editFormData, birth_date: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              School
            </label>
            <select
              value={editFormData.school_id}
              onChange={(e) =>
                setEditFormData({ ...editFormData, school_id: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="1001">
                University of Santo Tomas (UST)
              </option>
              <option value="1002">Asuncion Consunji Elementary School (ACES)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg"
            onClick={() => setIsEditMode(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#F6BA18] text-black rounded-lg"
            onClick={handleEditSubmit}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header title="Account" />
        <MobileNavBar navItems={navItems} />
        {editMessage.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              editMessage.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {editMessage.text}
          </div>
        )}
        <div className="mt-6 bg-white rounded-lg shadow-md">
          {/* Banner */}
          <div
            className="h-40 rounded-t-lg bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg)",
            }}
          ></div>

          {/* Profile Picture and User Details */}
          <div className="flex flex-col items-center md:items-start px-8 -mt-16">
            {renderProfilePicture()}
            <h2 className="mt-4 text-3xl font-semibold md:ml-8">
              {`${user.first_name} ${user.last_name}`}
            </h2>
            <p className="bg-[#F6BA18] px-3 py-1 rounded-md inline-block md:ml-8 mt-3">
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </p>
          </div>

          <div className="p-[1vw]">
            {/* Personal Information Section */}
            <div className="mt-4 mx-6 mb-12">
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <h3 className="text-xl font-semibold mb-4 md:mb-0">
                    Personal Information
                  </h3>
                  <div className="flex flex-col md:flex-row gap-2">
                    <button
                      aria-label="change_password"
                      className="px-4 py-2 text-sm bg-[#212529] text-white font-medium rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300"
                      onClick={handleOpenModal}
                    >
                      Change Password
                    </button>
                    <button
                      className="px-4 py-2 text-sm bg-[#212529] text-white font-medium rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300"
                      onClick={handleEditClick}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.first_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Middle Initial:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.middle_initial || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Email:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Contact Number:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.contact_no || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Birthday:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user.birth_date
                        ? new Date(user.birth_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      School:
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getSchoolName(user.school_id)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-1/2 lg:w-1/3 relative">
            <button
              className="absolute top-2 right-3 text-3xl font-semibold text-gray-500 hover:text-gray-800"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="relative">
              <input
                type={oldPasswordVisible ? "text" : "password"}
                placeholder="Old Password"
                className="w-full p-2 border rounded mb-2 pr-[6vw] lg:pr-[2.5vw]"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setOldPasswordVisible(!oldPasswordVisible)}
              >
                {oldPasswordVisible ? (
                  <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                ) : (
                  <Eye className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={newPasswordVisible ? "text" : "password"}
                placeholder="New Password"
                className="w-full p-2 border rounded mb-2 pr-[6vw] lg:pr-[2.5vw]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setNewPasswordVisible(!newPasswordVisible)}
              >
                {newPasswordVisible ? (
                  <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                ) : (
                  <Eye className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full p-2 border rounded mb-2 pr-[6vw] lg:pr-[2.5vw]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              >
                {confirmPasswordVisible ? (
                  <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                ) : (
                  <Eye className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                )}
              </button>
            </div>
            {message && (
              <p
                className={`mt-2 ${
                  message.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#F6BA18] text-black rounded-lg"
                onClick={handleChangePassword}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {isEditMode && renderEditModal()}
    </div>
  );
}

export default Profile;
