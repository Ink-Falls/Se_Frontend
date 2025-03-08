
import React, { useState, useEffect } from 'react';
import Modal from '../../Button/Modal'; // Your Modal component

function EditUserModal({ user, onClose, onSave }) {
    const [editedUser, setEditedUser] = useState(user);

    // IMPORTANT: Update local state if the 'user' prop changes
    useEffect(() => {
        setEditedUser(user);
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }));
    };
     const handleImageChange = (e) => { //added image change
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedUser(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editedUser); // Pass the updated user data to the parent
        onClose();        // Close the modal
    };


    if (!user) {
        return null; // Don't render anything if no user is provided
    }


    return (
      <Modal isOpen={true} onClose={onClose}>
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              First Name:
            </label>
            <input
              type="text"
              name="first_name"
              value={editedUser.first_name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
              Last Name:
            </label>
            <input
              type="text"
              name="last_name"
              value={editedUser.last_name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
              Middle Initial:
            </label>
            <input
              type="text"
              name="middle_initial"
              value={editedUser.middle_initial || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="mb-4">
           <label className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={editedUser.email || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        
          <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
              Contact No:
            </label>
            <input
              type="text"
              name="contact_no"
              value={editedUser.contact_no || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
           <div>
                <label className="block text-sm font-medium text-gray-700">Birthdate:</label>
                <input
                    type="date"
                    name="birth_date"
                    value={editedUser.birth_date ? new Date(editedUser.birth_date).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">School ID:</label>
                <input
                    type="text"
                    name="school_id"
                    value={editedUser.school_id || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

          <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
              Role:
            </label>
            <select
              name="role"
              value={editedUser.role || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"

            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="learner">Learner</option>
              <option value="student_teacher">Student Teacher</option>
            </select>
          </div>
           <div>
                <label className="block text-sm font-medium text-gray-700 mt-4"> Image </label>
                    <input type="file" name="image" onChange={handleImageChange} className="mt-1 block w-full" accept="image/*"/>
                        {editedUser.image && (
                            <img src={editedUser.image} alt="User Image" className="mt-2 h-20 w-auto" />
                        )}
            </div>

          {/* Add more input fields for other user properties as needed */}

          <div className="mt-4">
            <button type="submit" className="px-4 py-2 mr-2 bg-green-500 text-white rounded hover:bg-green-700">Save Changes</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Cancel</button>
          </div>
        </form>
      </Modal>
    );
}
export default EditUserModal;