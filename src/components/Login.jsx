import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

function Login() {
  const [email, setEmail] = useState(''); // State to store email input
  const [password, setPassword] = useState(''); // State to store password input
  const [captchaVerified, setCaptchaVerified] = useState(false); // State to track CAPTCHA verification
  const navigate = useNavigate(); // Hook to navigate to other pages

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if CAPTCHA is verified before proceeding
    if (!captchaVerified) {
      alert('Please verify the CAPTCHA to proceed.');
      return;
    }

    console.log('Email:', email); // Log email
    console.log('Password:', password); // Log password
    navigate('/Home'); // Navigate to the Home page after successful login
  };

  // Handles CAPTCHA verification state change
  const handleCaptchaChange = (value) => {
    console.log('Captcha value:', value); // Log CAPTCHA response
    setCaptchaVerified(!!value); // Set to true if CAPTCHA is solved
  };

  // Placeholder function for "Forgot Password" button
  const handleForgotPassword = () => {
    alert('Forgot Password functionality is not implemented yet.');
  };

  // Placeholder function for "Enroll" button
  const handleEnroll = () => {
    navigate('/Enrollment');
  };

  return (
    <>
      {/* Set background image and make the page scrollable */}
      <div
        className="min-h-screen bg-cover bg-center"
        style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)' }}
      >
        {/* Header section with navigation and title */}
        <header className="py-[3vw] px-[4vw] lg:py-[1.5vw] lg:px-[2vw] bg-[#121212] text-[#F6BA18] flex justify-between items-center shadow-xl">
          <div className="text-[8vw] lg:text-[1.5vw] font-bold">
            <span className="text-[#F6BA18]">Aral</span>
            <span className="text-[#FFFFFF]">Kademy</span>
          </div>

          {/* Enroll button */}
          <button
            onClick={handleEnroll}
            className="text-[4vw] py-[1vw] px-[6vw] lg:text-[1vw] lg:py-[0.5vw] lg:px-[2vw] bg-[#F6BA18] text-[#212529] font-bold rounded-md hover:bg-[#64748B] hover:text-[#FFFFFF] transition-colors duration-300 ease-in-out"
          >
            Enroll
          </button>
        </header>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen">
          {/* Wrapper for left and right sections */}
          <div className="mt-[-10vw] sm:mt-[0vw] lg:mt-[-5vw] flex flex-col lg:flex-row items-center p-[2vw] rounded-lg gap-[15vw]">
            {/* Left side: Title and description */}
            <div className="text-left lg:block hidden lg:mt-[-5vw]">
              <h1 className="text-[4vw] font-extrabold drop-shadow-[5px_5px_5px_rgba(0,0,0,0.8)]">
                <span className="text-[#F6BA18]">Aral</span>
                <span className="text-[#FFFFFF]">Kademy</span>
              </h1>
              <p className="text-[#FFFFFF] mt-[0vw] max-w-md drop-shadow-[3px_3px_3px_rgba(0,0,0,0.8)] text-[1.2vw]">
                Learning Management System for UST NSTP-LTS and Partner Communities
              </p>
            </div>

            {/* Right side: Login form */}
            <div className="p-[5vw] w-[80vw] lg:p-[3vw] lg:w-[30vw] bg-white rounded-lg shadow-2xl relative">
              {/* Yellow top border */}
              <div className="top-[0vw] left-[0vw] h-[1.5vw] lg:top-[0vw] lg:left-[0vw] lg:h-[0.5vw] absolute w-full bg-[#F6BA18] rounded-t-lg"></div>

              {/* Login form header */}
              <h2 className="text-[8vw] lg:text-[2.5vw] font-bold text-left text-[#212529]">Log In</h2>

              {/* Form instruction text */}
              <p className="text-[3vw] mb-[8vw] lg:mb-[1.5vw] lg:text-[0.8vw] text-[#64748B] text-left">
                Please fill in your login information to proceed
              </p>

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-[1vw]">
                {/* Email input */}
                <div>
                  <label htmlFor="email" className="text-[3vw] block text-[#64748B] lg:text-[0.8vw]">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password input */}
                <div>
                  <label htmlFor="password" className="mt-[5vw] text-[3vw] lg:text-[0.8vw] lg:mt-[0vw] block text-[#64748B]">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-[1vw] text-[3vw] px-[3vw] py-[2vw] lg:mt-[0.2vw] lg:text-[0.8vw] lg:px-[1vw] lg:py-[0.6vw] w-full border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Forgot password button */}
                <div className="text-right mt-[0.5vw]">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[3vw] lg:text-[0.8vw] text-[#64748B] hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* CAPTCHA verification */}
                <div className="mt-[1vw] overflow-visible h-auto">
                  <div
                    style={{
                      transformOrigin: 'left',
                      transform: 'scale(0.8)'
                    }}
                  >
                    <ReCAPTCHA
                      sitekey="your-site-key"
                      onChange={handleCaptchaChange}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-center mt-[0.5vw]">
                  <button
                    type="submit"
                    className="py-[2vw] px-[12vw] text-[4vw] mb-[2vw] mt-[2vw] lg:mb-[0vw] lg:mt-[0vw] lg:py-[0.6vw] lg:px-[4vw] lg:text-[1vw] bg-[#212529] text-[#FFFFFF] font-bold rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 ease-in-out"
                    disabled={!captchaVerified}
                  >
                    Log In
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
