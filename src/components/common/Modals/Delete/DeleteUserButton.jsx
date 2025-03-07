import React, { useState } from 'react';
import { Trash2, XCircle, CheckCircle } from 'lucide-react';
import Modal from '../../Button/Modal'; // Import your Modal component

function DeleteUserButton({ userId, onDelete }) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // Track deleting state
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                onDelete(userId); // Callback to update the user list
                setIsConfirming(false); // close modal
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to delete user.');
            }
        } catch (err) {
            setError('Network error.  Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

     const handleCancel = () => {
        setIsConfirming(false)
        setError(null)
    }

    if(!isConfirming) return (
        <button
            onClick={() => setIsConfirming(true)} // Show confirmation on click
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
            disabled={isDeleting}
            title="Delete User"
        >
            <Trash2 size={16} />
        </button>
    );

    return(
        <Modal isOpen={isConfirming} onClose={() => setIsConfirming(false)}>
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this user?</p>
             {error && <p className="text-red-500 mt-2">{error}</p>}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300 mr-2"
                    disabled={isDeleting}
                >
                      {isDeleting ? (
                        <>Deleting...</>
                        ) : (
                        <>
                            <CheckCircle size={16} className="inline mr-1" /> Yes, Delete
                        </>
                    )}

                </button>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    disabled={isDeleting}
                >
                    <XCircle size={16} className="inline mr-1" /> Cancel
                </button>
            </div>
        </Modal>
    )
}

export default DeleteUserButton;