import React, { useState, useEffect } from "react";
import { verifyMagicLinkToken } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Add this import

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedPictures.length < 3) {
      setError("Please select at least 3 pictures");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a code from picture NAMES not IDs
      const pictureCode = selectedPictures
        .map((p) => ID_TO_NAME_MAP[p.id])
        .join("-");

      // Use the verification endpoint with the picture code
      const response = await verifyMagicLinkToken(pictureCode);

      // Store tokens using the direct format from backend
      if (response) {
        // Set tokens using the correct format
        localStorage.setItem("accessToken", response.token || "");
        localStorage.setItem("refreshToken", response.refreshToken || "");

        // Store user data if available
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }

        // Update auth context - critical step
        await checkAuth();
      }

      setSuccess(true);

      // Redirect after a short delay to show success animation
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
    } catch (err) {
      console.error("Picture verification failed:", err);
      setError(
        "Oops! That's not the right picture sequence. Please try again."
      );
      setSelectedPictures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedPictures([]);
    setError(null);

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
        <div className="bg-red-50 p-3 rounded-md border border-red-200">
          <p className="text-red-500 text-center text-[3vw] lg:text-[0.9vw] max-lg:text-[2.5vw]">
            {error}
          </p>
        </div>
      )}

      {/* Selected pictures preview */}
      <div className="mb-6">
        <p className="text-[3vw] text-center mb-2 text-[#64748B] lg:text-[0.9vw] max-lg:text-[2.5vw]">
          Select your picture sequence to log in:
        </p>

        <div className="flex justify-center items-center space-x-2 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-2">
          {selectedPictures.length === 0 ? (
            <span className="text-gray-400 text-sm">Select pictures below</span>
          ) : (
            selectedPictures.map((pic, idx) => (
              <div key={idx} className="relative">
                <img
                  src={pic.url}
                  alt={pic.name}
                  className="w-14 h-14 object-contain p-1 bg-white rounded border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePicture(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Picture grid */}
      <div className="grid grid-cols-3 gap-4">
        {pictures.map((pic) => (
          <button
            key={pic.id}
            type="button"
            onClick={() => handlePictureSelect(pic)}
            disabled={selectedPictures.some((p) => p.id === pic.id)}
            className={`p-2 rounded-lg border-2 transition-all ${
              selectedPictures.some((p) => p.id === pic.id)
                ? "border-[#F6BA18] bg-yellow-50 opacity-60"
                : "border-gray-200 hover:border-[#F6BA18] hover:shadow-md"
            }`}
          >
            <img
              src={pic.url}
              alt={pic.name}
              className="w-full h-14 lg:h-20 object-contain"
            />
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-6 space-x-3">
        <button
          type="button"
          onClick={handleReset}
          className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedPictures.length < 3 || isLoading}
          className="flex items-center justify-center min-w-[10rem] px-6 py-3 
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
            <span className="text-xs sm:text-sm md:text-base lg:text-base">
              Log In
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default PictureCodeLogin;
