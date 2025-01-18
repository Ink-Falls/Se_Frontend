import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent scrolling when the component mounts
    document.body.style.overflow = 'hidden';

    // Clean up when the component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    navigate('/Home');
  };

  const handleForgotPassword = () => {
    alert('Forgot Password functionality is not implemented yet.');
  };

  const handleEnroll = () => {
    alert('Enroll functionality is not implemented yet.');
  };

  return (
    <>
      {/* Set background image and make the page unscrollable */}
      <div
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: 'url(https://i.imgur.com/d6dRrzK.jpeg)' }}
      >
        <header className="bg-black text-white py-8 px-12 flex justify-between items-center shadow-xl">
          <div className="text-5xl font-bold">
            <span className="text-yellow-400">Aral</span>
            <span className="text-white">Kademy</span>
          </div>

          <button
            onClick={handleEnroll}
            className="bg-yellow-400 text-black font-semibold py-4 px-10 rounded-md hover:bg-yellow-500 transition-colors text-xl"
          >
            Enroll
          </button>
        </header>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center p-20 rounded-lg space-x-[400px]" style={{ marginTop: '-100px' }}>

            {/* Left Side: Title and Subtitle */}
            <div className="text-left" style={{ marginTop: '-200px' }}>
              <h1 className="text-8xl font-extrabold drop-shadow-[5px_5px_5px_rgba(0,0,0,0.8)]">
                <span className="text-yellow-400">Aral</span>
                <span className="text-white">Kademy</span>
              </h1>
              <p className="text-white mt-4 max-w-md drop-shadow-[3px_3px_3px_rgba(0,0,0,0.8)] text-2xl">
                Learning Management System for UST NSTP-LTS and Partner Communities
              </p>
            </div>

            {/* Right Side: Login Form */}
            <div className="bg-white p-12 rounded-lg shadow-2xl w-[600px] relative">

              {/* Thick Yellow Top Border */}
              <div className="absolute top-0 left-0 w-full h-4 bg-yellow-400 rounded-t-lg"></div>

              <h2 className="text-4xl font-bold mb-6 text-left">Login</h2>
              <p className="text-xl text-gray-500 text-left mb-10">
                Please fill in your login information to proceed
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label htmlFor="email" className="block text-xl font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-3 w-full px-8 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xl"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xl font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-3 w-full px-8 py-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xl"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Forgot Password Button */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xl text-gray-500 hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-black text-white py-4 px-12 rounded-md hover:bg-gray-800 transition-colors text-xl"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
