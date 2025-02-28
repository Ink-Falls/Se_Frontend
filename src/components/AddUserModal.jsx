// AddUserModal.jsx
import React, { useState } from 'react';
import Modal from './Modal'; // Import your Modal component
import { Save, XCircle } from "lucide-react";

function AddUserModal({ isOpen, onClose, onUserAdded }) {
    const [newUser, setNewUser] = useState({
        first_name: '',
        last_name: '',
        middle_initial: '',
        email: '',
        password: '',
        confirm_password: '', // Include confirm_password
        birth_date: '',
        contact_no: '',
        school_id: '',
        role: '',
    });

    const [errors, setErrors] = useState({}); // For validation errors

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear the specific error when the input changes:
        setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors
        const clientErrors = {};

        // --- Client-Side Validation ---
        if (!newUser.first_name) {
            clientErrors.first_name = "First name is required.";
        }
        if (!newUser.last_name) {
            clientErrors.last_name = "Last name is required.";
        }
        if (!newUser.email) {
            clientErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
            clientErrors.email = "Invalid email format.";
        }
        if (!newUser.password) {
            clientErrors.password = "Password is required.";
        } else if (newUser.password.length < 8) {
            clientErrors.password = "Password must be at least 8 characters long.";
        }
        if (newUser.password !== newUser.confirm_password) {
            clientErrors.confirm_password = "Passwords do not match.";
        }
        if (!newUser.contact_no) {
            clientErrors.contact_no = "Contact number is required.";
        } else if (!/^(?:\+63|0)?9\d{9}$/.test(newUser.contact_no.replace(/[-\s()]/g, ""))) {
            clientErrors.contact_no = "Invalid contact number format.";
        }
        if (!newUser.school_id) {
            clientErrors.school_id = "School ID is required.";
        } else if (isNaN(parseInt(newUser.school_id))) {
            clientErrors.school_id = "School ID must be a number.";
        }

        if (!newUser.role) {
            clientErrors.role = "Role is required.";
        }
          if (newUser.middle_initial.length > 3) {
           clientErrors.middle_initial = "Middle initial must be at most 3 characters.";
        }
        if (newUser.birth_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const birthDate = new Date(newUser.birth_date);

            if (birthDate >= today) {
                clientErrors.birth_date = 'Birthdate must be in the past';
            }
        }


        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return; // Stop if client-side errors exist
        }

        // --- Prepare data for sending (remove confirm_password and image) ---
        const { confirm_password, ...userData } = newUser;
        // Clean up contact number.  Do this *after* client-side validation.
        userData.contact_no = userData.contact_no.replace(/[-\s()]/g, "");
         // Convert school_id to integer
        userData.school_id = parseInt(userData.school_id, 10);

        // Format birth_date as YYYY-MM-DD (important for consistency)
        if (userData.birth_date) {
            userData.birth_date = new Date(userData.birth_date).toISOString().split('T')[0];
        }

        console.log("Data being sent to server:", userData);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:4000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData) // Send the cleaned userData
            });

            if (response.ok) {
                const addedUser = await response.json();
                onUserAdded(addedUser.user);  // Call the callback!  Pass the new user data.
                onClose(); // Close the modal
                // Optionally reset the form *here* if you prefer:
                 setNewUser({
                    first_name: '',
                    last_name: '',
                    middle_initial: '',
                    email: '',
                    password: '',
                    confirm_password: '',
                    birth_date: '',
                    contact_no: '',
                    school_id: '',
                    role: '',
                });

            } else {
                const errorData = await response.json();
                 if (response.status === 400 && errorData.message) {
                    // Handle specific Sequelize validation errors (like unique constraint)
                     if(errorData.message === 'Email already exists'){
                        setErrors({ email: "Email already exists. Please use a different email." });
                     }
                     else{
                        setErrors({ general: errorData.message});
                     }
                } else if (response.status === 400 && errorData.errors) {
                    // Handle general validation errors sent from the server
                    const serverErrors = {};
                    errorData.errors.forEach(error => {
                        serverErrors[error.path] = error.msg; //  e.g., { first_name: "First name cannot be empty." }
                    });
                    setErrors(serverErrors);
                } else {
                    setErrors({ general: errorData.message || "Failed to add user." }); // Generic error
                }
            }
        } catch (error) {
            console.error("Error adding user:", error);
            setErrors({ general: "Network error. Please try again." }); // Network error
        }
    };



    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name:</label>
                        <input
                            type="text"
                            name="first_name"
                            value={newUser.first_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={newUser.last_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"

                        />
                        {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Middle Initial:</label>
                        <input
                            type="text"
                            name="middle_initial"
                            value={newUser.middle_initial}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         {errors.middle_initial && <p className="text-red-500 text-sm mt-1">{errors.middle_initial}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={newUser.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"

                        />
                         {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Contact No:</label>
                        <input
                            type="text"
                            name="contact_no"
                            value={newUser.contact_no}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {errors.contact_no && <p className="text-red-500 text-sm mt-1">{errors.contact_no}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Birthdate:</label>
                        <input
                            type="date"
                            name="birth_date"
                            value={newUser.birth_date}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"

                        />
                         {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">School ID:</label>
                        <input
                            type="text"
                            name="school_id"
                            value={newUser.school_id}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {errors.school_id && <p className="text-red-500 text-sm mt-1">{errors.school_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role:</label>
                        <select
                            name="role"
                            value={newUser.role}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="learner">Learner</option>
                            <option value="student_teacher">Student Teacher</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={newUser.password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password:</label>
                        <input
                            type="password"
                            name="confirm_password"
                            value={newUser.confirm_password}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
                    </div>
                </div>

                <div className="mt-4">
                    <button type="submit"  className="px-4 py-2 mr-2 bg-green-500 text-white rounded hover:bg-green-700">
                        <Save size={16} className="inline mr-1" /> Add User
                    </button>
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">
                        <XCircle size={16} className="inline mr-1"/> Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default AddUserModal;