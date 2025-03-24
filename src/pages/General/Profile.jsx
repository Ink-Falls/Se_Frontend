import React, { useState, useEffect } from 'react';
import { getUserById } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/layout/Sidebar';
import Header from '../../components/common/layout/Header';
import { Book, Bell, FileText, Home } from 'lucide-react';
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "../../services/authService"; // Import function
import profileImg from "/src/assets/images/profile2.jpeg"; // Add this import

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState("");
    const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const navigate = useNavigate();
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage('');
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (authLoading) return;
                
                // Check authentication
                if (!isAuthenticated) {
                    navigate('/login');
                    return;
                }

                // Get user from localStorage
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (!storedUser || !storedUser.id) {
                    console.error('No user data in localStorage');
                    setError('User data not found');
                    return;
                }

                if (storedUser.role === 'learner') {
                    // For learners, use stored data
                    setUser(storedUser);
                } else {
                    try {
                        // For teachers/admins, get fresh data
                        const freshData = await getUserById(storedUser.id);
                        setUser(freshData || storedUser); // Fallback to stored data if fetch fails
                    } catch (err) {
                        console.error('Failed to fetch fresh data:', err);
                        // Fallback to stored data on error
                        setUser(storedUser);
                    }
                }
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [isAuthenticated, authLoading, navigate]);

    const getSchoolName = (schoolId) => {
        const schools = {
            "1001": "Asuncion Consunji Elementary School (ACES)",
            "1002": "University of Santo Tomas (UST)",
            "1003": "De la Salle University (DLSU)"
        };
        return schools[schoolId] || 'N/A';
    };

    const getRoleBasedNavItems = (role) => {
        switch(role?.toLowerCase()) {
            case 'admin':
                return [
                    { text: "Users", icon: <Home size={20} />, route: "/Admin/Dashboard" },
                    { text: "Courses", icon: <Book size={20} />, route: "/Admin/Courses" },
                    { text: "Enrollments", icon: <Bell size={20} />, route: "/Admin/Enrollments" },
                    { text: "Announcements", icon: <FileText size={20} />, route: "/Admin/Announcements" },
                ];
            case 'teacher':
            case 'student_teacher':
                return [
                    { text: "Home", icon: <Home size={20} />, route: "/Teacher/Dashboard" },
                    { text: "Courses", icon: <Book size={20} />, route: "/Teacher/Courses" },
                    { text: "Notifications", icon: <Bell size={20} />, route: "/Teacher/Notifications" },
                    { text: "Announcements", icon: <FileText size={20} />, route: "/Teacher/Announcements" },
                ];
            case 'learner':
                return [
                    { text: "Home", icon: <Home size={20} />, route: "/Learner/Dashboard" },
                    { text: "Courses", icon: <Book size={20} />, route: "/Learner/Courses" },
                    { text: "Notifications", icon: <Bell size={20} />, route: "/Learner/Notifications" },
                    { text: "Announcements", icon: <FileText size={20} />, route: "/Learner/Announcements" },
                ];
            default:
                return [];
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            setMessage('Please fill out all fields.');
            return;
        }

        const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordPattern.test(newPassword)) {
            setMessage("Password must have at least 8 characters, one digit, and one symbol.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match. Please try again.');
            return;
        }

        try {
            await changePassword(user.id, oldPassword, newPassword, confirmPassword);
            setMessage('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Password change error:', err);
            setMessage(err.message || 'Failed to change password. Please try again.');
        }
    };

    // Add null check for user in render
    if (!user || loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100 relative">
            <Sidebar navItems={getRoleBasedNavItems(user?.role)} />
            <div className="flex-1 p-6 overflow-auto">
                <Header title="Account" />
                <div className="mt-6 bg-white rounded-lg shadow-md">
                    {/* Banner */}
                    <div className="h-40 rounded-t-lg bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg)' }}>
                    </div>

                    {/* Profile Picture and User Details */}
                    <div className="flex flex-col items-center md:items-start px-8 -mt-16">
                        <img
                            src={profileImg}
                            alt="Profile"
                            className="w-40 h-40 rounded-full border-4 border-white md:ml-8"
                        />
                        <h2 className="mt-4 text-3xl font-semibold md:ml-8">
                            {`${user.first_name} ${user.last_name}`}
                        </h2>
                        <p className="bg-[#F6BA18] px-3 py-1 rounded-md inline-block md:ml-8">
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                        </p>
                        <div className="mt-2 mx-2">
                            <button className="mt-6 py-[1.5vw] px-[7vw] text-[3.5vw] max-lg:text-[2.5vw] lg:py-[0.4vw] lg:px-[3vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-semibold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out" 
                            onClick={handleOpenModal}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                    <div className="p-[1vw]">
                        {/* Personal Information Section */}
                        <div className="mt-4 mx-6 mb-12">
                            <div className="border-2 border-gray-200 rounded-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.first_name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.last_name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Middle Initial:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.middle_initial || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Contact Number:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.contact_no || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Birthday:</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">School:</label>
                                        <p className="mt-1 text-sm text-gray-900">{getSchoolName(user.school_id)}</p>
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
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
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
                                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            >
                                {confirmPasswordVisible ? (
                                                <EyeOff className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                                            ) : (
                                                <Eye className="w-[4vw] h-[4vw] lg:w-[1.3vw] lg:h-[1.3vw]" />
                                            )}
                            </button>
                        </div>
                        {message && (
                            <p className={`mt-2 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
                            {message}
                            </p>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={handleCloseModal}>Cancel</button>
                            <button className="px-4 py-2 bg-[#F6BA18] text-black rounded-lg" onClick={handleChangePassword}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;