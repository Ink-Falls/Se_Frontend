import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = () => {
    // Perform logout logic here (clear auth tokens, etc.)
    navigate('/logout'); // Redirect to login page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to the Homepage!</h2>
        <p className="text-lg text-gray-700 mb-6 text-center">
          You are successfully logged in. Enjoy your stay!
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Home;
