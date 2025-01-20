import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false); // Track CAPTCHA verification
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!captchaVerified) {
      alert('Please verify the CAPTCHA to proceed.');
      return;
    }

    console.log('Email:', email);
    console.log('Password:', password);
    navigate('/Home');
  };

  const handleCaptchaChange = (value) => {
    console.log('Captcha value:', value);
    setCaptchaVerified(!!value); // Set to true if CAPTCHA is solved
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
        style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/7/7b/400_Year_old_Beauty.jpg)' }}
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
          <div className="flex flex-col md:flex-row items-center p-[2vw] rounded-lg gap-[15vw]" style={{ marginTop: '-5vw' }}>
            {/* Left Side: Title and Subtitle */}
            <div className="text-left md:block hidden" style={{ marginTop: '-10vw' }}>
              <h1 className="text-[4vw] font-extrabold drop-shadow-[5px_5px_5px_rgba(0,0,0,0.8)]">
                <span className="text-[#F6BA18]">Aral</span>
                <span className="text-[#FFFFFF]">Kademy</span>
              </h1>
              <p className="text-[#FFFFFF] mt-[0vw] max-w-md drop-shadow-[3px_3px_3px_rgba(0,0,0,0.8)] text-[1.2vw]">
                Learning Management System for UST NSTP-LTS and Partner Communities
              </p>
            </div>

            {/* Right Side: Login Form */}
            <div className="bg-white p-[3vw] rounded-lg shadow-2xl w-[30vw] relative">
              {/* Thick Yellow Top Border */}
              <div className="absolute top-[0vw] left-[0vw] w-full h-[0.5vw] bg-[#F6BA18] rounded-t-lg"></div>
              <h2 className="text-[2.5vw] font-bold text-left text-[#212529]">Log In</h2>
              <p className="text-[0.8vw] text-[#64748B] text-left mb-[1.5vw]">
                Please fill in your login information to proceed
              </p>

              <form onSubmit={handleSubmit} className="space-y-[1vw]">
                <div>
                  <label htmlFor="email" className="block text-[0.8vw] text-[#64748B]">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-[0.2vw] text-[0.8vw] w-full px-[2vw] py-[0.6vw] border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-[0.8vw] text-[#64748B]">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-[0.2vw] text-[0.8vw] w-full px-[2vw] py-[0.6vw] border border-[#64748B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#64748B] placeholder-[#64748B] text-[#212529]"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Forgot Password Button */}
                <div className="text-right" style={{ marginTop: '0.5vw' }}>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[0.8vw] text-[#64748B] hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* CAPTCHA */}
                <div className="mt-[1vw]" style={{ overflow: 'visible', height: 'auto' }}>
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

                {/* Login Button */}
                <div className="flex justify-center mt-[0.5vw]"> {/* Reduced margin to 0.5vw */}
                  <button
                    type="submit"
                    className="bg-[#212529] text-[#FFFFFF] py-[0.6vw] px-[4vw] text-[1vw] font-semibold rounded-md"
                    disabled={!captchaVerified} // Disable button until CAPTCHA is solved
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
