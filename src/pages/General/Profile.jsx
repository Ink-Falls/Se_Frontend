import React, { useState, useEffect } from 'react';
import { getUserById } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/layout/Sidebar';
import Header from '../../components/common/layout/Header';
import { Book, Bell, FileText, Home } from 'lucide-react';
import profileImg from "/src/assets/images/profile2.jpeg"; // Add this import

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

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
        </div>
    );
}

export default Profile;