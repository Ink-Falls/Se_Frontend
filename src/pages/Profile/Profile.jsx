import React, { useState, useEffect } from "react";
// ...existing imports...
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  // ...existing state declarations...

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userId = user?.id;
        if (!userId) {
          throw new Error("User ID not found");
        }

        const userData = await getUserById(userId);
        setUserData(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // ...existing render code...
  return (
    <div>
      {/* ...existing code... */}
      <input
        type="text"
        value={editFormData.middle_initial}
        onChange={(e) =>
          setEditFormData({
            ...editFormData,
            middle_initial: e.target.value.toUpperCase().slice(0, 2),
          })
        }
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        maxLength={2}
      />
      {/* ...existing code... */}
    </div>
  );
};

export default Profile;
