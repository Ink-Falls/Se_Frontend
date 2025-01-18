import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
      {/* Set background image and make the page scrollable */}
      <div
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: 'url(https://i.imgur.com/d6dRrzK.jpeg)' }}
      >
        <header className="bg-[#121212] text-[#F6BA18] py-[1.5vw] px-[2vw] flex justify-between items-center shadow-xl">
          <div className="text-[1.5vw] font-bold">
            <span className="text-[#F6BA18]">Aral</span>
            <span className="text-[#FFFFFF]">Kademy</span>
          </div>

          <button
            onClick={handleEnroll}
            className="bg-[#F6BA18] text-[#212529] font-bold py-[0.5vw] px-[2vw] rounded-md transition-colors text-[1vw]"
          >
            Enroll
          </button>
        </header>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen">
          <div
            className="flex flex-col md:flex-row items-center p-[2vw] rounded-lg gap-[5vw]"
          >

            {/* Left Side: Title and Subtitle */}
            <div className="text-left md:block hidden" style={{ marginTop: '-100px' }}>
              <h1 className="text-[4vw] font-extrabold drop-shadow-[5px_5px_5px_rgba(0,0,0,0.8)]">
                <span className="text-[#F6BA18]">Aral</span>
                <span className="text-[#FFFFFF]">Kademy</span>
              </h1>
              <p className="text-[#FFFFFF] mt-[1vw] max-w-md drop-shadow-[3px_3px_3px_rgba(0,0,0,0.8)] text-[1.2vw]">
                Learning Management System for UST NSTP-LTS and Partner Communities
              </p>
            </div>

            {/* Right Side: Login Form */}
            <div className="bg-white p-[3vw] rounded-lg shadow-2xl w-[33vw] relative">
              {/* Thick Yellow Top Border */}
              <div className="absolute top-0 left-0 w-full h-[0.5vw] bg-[#F6BA18] rounded-t-lg"></div>

              <h2 className="text-[2.5vw] font-bold mb-[1vw] text-left text-[#212529]">Log In</h2>
              <p className="text-[1vw] text-[#64748B] text-left mb-[1.5vw]">
                Please fill in your login information to proceed
              </p>

              <form onSubmit={handleSubmit} className="space-y-[1vw]">
                <div>
                  <label htmlFor="email" className="block text-[1vw] text-[#64748B]">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-[0.5vw] w-full px-[2vw] py-[1vw] border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] text-[#64748B]"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[1vw] text-[#64748B]">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-[0.5vw] w-full px-[2vw] py-[1vw] border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] text-[#64748B]"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Forgot Password Button */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[1vw] text-[#64748B] hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="bg-[#212529] text-[#FFFFFF] py-[0.6vw] px-[4vw] font-semibold rounded-md"
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
