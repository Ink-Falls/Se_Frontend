import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "/src/components/common/layout/Sidebar.jsx";
import Header from "/src/components/common/layout/Header.jsx";
import {
    Home,
    Book,
    Bell,
    FileText,
} from "lucide-react";

function Profile() {

    const navItems = [
        { text: "Users", icon: <Home size={20} />, route: "/Admin/Dashboard" },
        { text: "Courses", icon: <Book size={20} />, route: "/Admin/Courses" },
        { text: "Enrollments", icon: <Bell size={20} />, route: "/Admin/Enrollments" },
        { text: "Announcements", icon: <FileText size={20} />, route: "/Admin/Announcements" },
    ];

    // Example user data
    const user = {
        profilePicture: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80",
        name: "John Doe",
        accountType: "Admin",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        contactNo: "123-456-7890",
        birthday: "1990-01-01",
        yearLevel: "Senior",
        school: "University of Example"
    };

    return (
        <div className="flex h-screen bg-gray-100 relative">
            <Sidebar navItems={navItems} />
            <div className="flex-1 p-6 overflow-auto">
                <Header title="Account" />
                <div className="mt-6 bg-white rounded-lg shadow-md">
                    {/* Banner */}
                    <div className="h-40 rounded-t-lg" style={{ backgroundImage: 'url(https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg)', backgroundSize: 'cover' }}></div>

                    {/* Profile Picture and User Details */}
                    <div className="flex flex-col items-center md:items-start px-8 -mt-16">
                        <img
                            src={user.profilePicture}
                            alt="Profile"
                            className="w-40 h-40 rounded-full border-4 border-white md:ml-8"
                        />
                        <h2 className="mt-4 text-3xl font-semibold md:ml-8">{user.name}</h2>
                        <p className="bg-[#F6BA18] px-3 py-1 rounded-md inline-block md:ml-8">{user.accountType}</p>
                    </div>
                    <div className="p-[1vw]">
                        {/* Personal Information Section */}
                        <div className="mt-4 mx-6 mb-12">
                            <div className="border-2 border-gray-200 rounded-lg p-6">
                            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Last Name:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Contact Number:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.contactNo}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Birthday:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.birthday}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Year Level:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.yearLevel}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">School:</label>
                                        <p className="mt-1 text-sm text-gray-900">{user.school}</p>
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