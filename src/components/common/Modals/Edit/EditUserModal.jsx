import React, { useState, useEffect } from 'react';
import Modal from '../../Button/Modal'; // Your Modal component

function EditUserModal({ user, onClose, onSave }) {
    const [editedUser, setEditedUser] = useState({
        ...user,
        // Explicitly exclude password
        password: undefined
    });

    // IMPORTANT: Update local state if the 'user' prop changes
    useEffect(() => {
        setEditedUser(user);
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'contact_no') {
          // Remove all non-digits
          let numbers = value.replace(/\D/g, '');
          
          // Ensure starts with '09'
          if (!numbers.startsWith('09')) {
            if (numbers.startsWith('63')) {
              numbers = '0' + numbers.substring(2);
            } else if (!numbers.startsWith('0')) {
              numbers = '09';
            }
          }
          
          // Limit to 11 digits
          numbers = numbers.slice(0, 11);
          
          // Format as 09XX-XXX-XXXX
          let formatted = numbers;
          if (numbers.length >= 4) {
            formatted = numbers.slice(0, 4) + '-' + numbers.slice(4);
          }
          if (numbers.length >= 7) {
            formatted = formatted.slice(0, 8) + '-' + formatted.slice(8);
          }
          
          setEditedUser(prev => ({
            ...prev,
            [name]: formatted
          }));
          return;
        }
        
        setEditedUser(prev => ({
          ...prev,
          [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Remove password from submission
        const { password, ...userWithoutPassword } = editedUser;
        onSave(userWithoutPassword); // Pass the updated user data to the parent
        onClose();        // Close the modal
    };


    if (!user) {
        return null; // Don't render anything if no user is provided
    }

    const schoolOptions = [
        { id: "1001", name: "Asuncion Consunji Elementary School (ACES)" },
        { id: "1002", name: "University of Santo Tomas (UST)" },
        { id: "1003", name: "De la Salle University (DLSU)" }
    ];

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
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">School:</label>
                <select
                    name="school_id"
                    value={editedUser.school_id || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="">Select School</option>
                    {schoolOptions.map(school => (
                        <option key={school.id} value={school.id}>
                            {school.name}
                        </option>
                    ))}
                </select>
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

          <div className="mt-4">
            <button type="submit" className="px-4 py-2 mr-2 bg-green-500 text-white rounded hover:bg-green-700">Save Changes</button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Cancel</button>
          </div>
        </form>
      </Modal>
    );
}
export default EditUserModal;