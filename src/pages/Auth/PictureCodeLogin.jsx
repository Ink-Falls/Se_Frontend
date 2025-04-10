import React, { useState, useEffect, useCallback, useRef } from "react";
import { verifyMagicLinkToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { debounce } from "lodash";

import dogImage from "../../assets/images/picture-codes/dog.png";
import catImage from "../../assets/images/picture-codes/cat.png";
import fishImage from "../../assets/images/picture-codes/fish.png";
import appleImage from "../../assets/images/picture-codes/apple.png";
import ballImage from "../../assets/images/picture-codes/ball.png";
import elephantImage from "../../assets/images/picture-codes/elephant.png";
import giraffeImage from "../../assets/images/picture-codes/giraffe.png";
import houseImage from "../../assets/images/picture-codes/house.png";
import iceCreamImage from "../../assets/images/picture-codes/iceCream.png";
import kiteImage from "../../assets/images/picture-codes/kite.png";

const SAMPLE_PICTURES = [
  { id: 1, url: dogImage, name: "Dog" },
  { id: 2, url: catImage, name: "Cat" },
  { id: 3, url: fishImage, name: "Fish" },
  { id: 4, url: appleImage, name: "Apple" },
  { id: 5, url: ballImage, name: "Ball" },
  { id: 6, url: elephantImage, name: "Elephant" },
  { id: 7, url: giraffeImage, name: "Giraffe" },
  { id: 8, url: houseImage, name: "House" },
  { id: 9, url: iceCreamImage, name: "Ice Cream" },
  { id: 10, url: kiteImage, name: "Kite" },
];

const ID_TO_NAME_MAP = {
  1: "dog",
  2: "cat",
  3: "fish",
  4: "apple",
  5: "ball",
  6: "elephant",
  7: "giraffe",
  8: "house",
  9: "ice-cream",
  10: "kite",
};

function PictureCodeLogin() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [selectedPictures, setSelectedPictures] = useState([]);
  const [pictures, setPictures] = useState(SAMPLE_PICTURES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const requestInProgressRef = useRef(false);
  const MAX_ATTEMPTS = 2; // Allow only 2 attempts before forcing reset

  // Shuffle pictures on component mount
  useEffect(() => {
    const shuffled = [...SAMPLE_PICTURES].sort(() => 0.5 - Math.random());
    setPictures(shuffled);
  }, []);

  const handlePictureSelect = (picture) => {
    // Only allow selecting up to 4 pictures (for example)
    if (selectedPictures.length < 4) {
      setSelectedPictures([...selectedPictures, picture]);
    }
  };

  const handleRemovePicture = (index) => {
    const updated = [...selectedPictures];
    updated.splice(index, 1);
    setSelectedPictures(updated);
  };

  // Debounced submit handler to prevent rapid requests
  const debouncedSubmit = useCallback(
    debounce(async (pictureCode) => {
      // If a request is already in progress, don't start another one
      if (requestInProgressRef.current) {
        return;
      }

      requestInProgressRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        // Use the verification endpoint with the picture code
        const response = await verifyMagicLinkToken(
          pictureCode,
          "picture_code"
        );

        // Handle successful response
        if (response) {
          // Store tokens using the correct format
          localStorage.setItem("accessToken", response.token || "");
          localStorage.setItem("refreshToken", response.refreshToken || "");

          // Store user data if available
          if (response.user) {
            localStorage.setItem("user", JSON.stringify(response.user));
          }

          // Update auth context - critical step
          await checkAuth();

          setSuccess(true);
          setFailedAttempts(0); // Reset failed attempts on success

          // Redirect after a short delay
          setTimeout(() => {
            const role = response.user?.role?.toLowerCase();
            let dashboardRoute = "/Learner/Dashboard";

            if (role === "admin") {
              dashboardRoute = "/Admin/Dashboard";
            } else if (role === "teacher" || role === "student_teacher") {
              dashboardRoute = "/Teacher/Dashboard";
            }

            navigate(dashboardRoute);
          }, 1500);
        }
      } catch (err) {
        console.error("Picture verification failed:", err);

        // Check if this is a rate limiting error
        if (
          err.message?.includes("Too many") ||
          err.message?.includes("rate limit") ||
          err.message?.includes("Circuit breaker")
        ) {
          setIsRateLimited(true);
          setError(
            "Too many attempts. Please wait and try again with a different pattern."
          );
        } else {
          setFailedAttempts((prev) => prev + 1);
          setError(
            "Oops! That's not the right picture sequence. Please try again."
          );
        }

        setSelectedPictures([]);

        // Force reset after too many attempts
        if (failedAttempts >= MAX_ATTEMPTS || isRateLimited) {
          handleReset();
        }
      } finally {
        setIsLoading(false);
        // Add a small delay before allowing another submission
        setTimeout(() => {
          requestInProgressRef.current = false;
        }, 1000);
      }
    }, 500), // 500ms debounce time
    [checkAuth, navigate, failedAttempts, isRateLimited]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedPictures.length < 3) {
      setError("Please select at least 3 pictures");
      return;
    }

    // Add this to prevent multiple submissions
    if (isLoading) {
      return;
    }

    if (isRateLimited || failedAttempts >= MAX_ATTEMPTS) {
      handleReset();
      setIsRateLimited(false);
      setFailedAttempts(0);
      return;
    }

    // Create a code from picture NAMES not IDs
    const pictureCode = selectedPictures
      .map((p) => ID_TO_NAME_MAP[p.id])
      .join("-");

    // Use the debounced function to prevent multiple rapid requests
    debouncedSubmit(pictureCode);
  };

  const handleReset = () => {
    setSelectedPictures([]);
    setError(null);

    // If we've hit rate limits, reset attempts
    if (isRateLimited) {
      setIsRateLimited(false);
      setFailedAttempts(0);
    }

    // Reshuffle the pictures
    const shuffled = [...SAMPLE_PICTURES].sort(() => 0.5 - Math.random());
    setPictures(shuffled);
  };

  if (success) {
    return (
      <div className="text-center p-6">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-[6vw] lg:text-[1.5vw] max-lg:text-[4vw] font-bold mb-4 text-[#212529]">
          Great job!
        </h3>
        <p className="text-[3vw] mb-4 lg:text-[0.9vw] max-lg:text-[2.5vw] text-[#64748B]">
          You selected the right pictures!
          <br />
          Taking you to your dashboard...
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#F6BA18] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="bg-red-50 p-3 rounded-md border border-red-200"
        >
          <p
            name="please select at least 3 pictures"
            className="text-red-500 text-center text-[3vw] lg:text-[0.9vw] max-lg:text-[2.5vw]"
          >
            {error}
          </p>
        </div>
      )}

      {/* Selected pictures preview */}
      <div>
        <div className="mt-2 flex justify-center items-center space-x-2 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-2">
          {selectedPictures.length === 0 ? (
            <span className="text-gray-400 text-[2.5vw] md:text-sm">
              Select pictures below
            </span>
          ) : (
            selectedPictures.map((pic, idx) => (
              <div key={idx} className="relative w-14 h-14">
                <img
                  src={pic.url}
                  alt={pic.name}
                  className="w-full h-full object-contain p-1 bg-white rounded border border-gray-200"
                />
                <button
                  aria-label={`Remove ${pic.name}`}
                  type="button"
                  onClick={() => handleRemovePicture(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  X
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Picture grid - Updated for better mobile responsiveness */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-4">
        {pictures.map((pic) => (
          <button
            key={pic.id}
            type="button"
            onClick={() => handlePictureSelect(pic)}
            disabled={selectedPictures.some((p) => p.id === pic.id)}
            className={`aspect-square p-2 rounded-lg border-2 transition-all ${
              selectedPictures.some((p) => p.id === pic.id)
                ? "border-[#F6BA18] bg-yellow-50 opacity-60"
                : "border-gray-200 hover:border-[#F6BA18] hover:shadow-md"
            }`}
          >
            <img
              src={pic.url}
              alt={pic.name}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-6 space-x-3">
        <button
          type="button"
          onClick={handleReset}
          className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-[3.5vw] lg:text-[1.2vw] 2xl:text-[0.8vw] max-lg:text-[2.5vw]"
        >
          Clear
        </button>

        <button
          aria-label="Log in"
          type="button"
          onClick={handleSubmit}
          disabled={selectedPictures.length < 3 || isLoading}
          className="flex items-center justify-center min-w-[10rem] px-6 py-2 
            font-semibold rounded-md transition-colors duration-300 flex-shrink-0
            text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] 
            disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="animate-pulse text-sm md:text-base">
                Checking...
              </span>
            </div>
          ) : (
            <span className="text-[5vw] md:text-[3vw] lg:text-[1.2vw] 2xl:text-[0.8vw] max-lg:text-[2.5vw]">
              Log In
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default PictureCodeLogin;
