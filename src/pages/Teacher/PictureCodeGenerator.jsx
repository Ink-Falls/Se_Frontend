import React, { useState } from "react";
import { requestPictureCode } from "../../services/authService";

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

const IMAGE_MAP = {
  dog: dogImage,
  cat: catImage,
  fish: fishImage,
  apple: appleImage,
  ball: ballImage,
  elephant: elephantImage,
  giraffe: giraffeImage,
  house: houseImage,
  "ice-cream": iceCreamImage,
  icecream: iceCreamImage,
  "ice cream": iceCreamImage,
  kite: kiteImage,
};

function PictureCodeGenerator() {
  const [studentEmail, setStudentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [codeData, setCodeData] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Student email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(studentEmail);

    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await requestPictureCode(studentEmail);
      
      // Handle different response formats
      if (data.pictures) {
        setCodeData(data);
      } else if (data.sequence) {
        setCodeData({ pictures: data.sequence });
      } else if (Array.isArray(data)) {
        setCodeData({ pictures: data });
      } else {
        setCodeData({ pictures: [data] }); // Last resort - try to use the whole response
      }
    } catch (err) {
      console.error("Picture code generation failed:", err);
      setError(
        err.message || "Failed to generate picture code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = () => {
    setCodeData(null);
  };

  // Function to render picture sequence
  const renderPictureSequence = (pictures) => {
    // If pictures is not an array or is empty, show an error message
    if (!Array.isArray(pictures) || pictures.length === 0) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-500">No pictures received from server</p>
          <p className="text-sm text-gray-500 mt-2">
            There was an issue loading the picture sequence. Please try again.
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center space-x-3">
        {pictures.map((pic, index) => {
          // Get the appropriate image based on the name
          let imgSrc;

          if (typeof pic === "string") {
            // Convert the string to lowercase for case-insensitive matching
            const picLower = pic.toLowerCase();
            imgSrc = IMAGE_MAP[picLower] || null;
          } else if (pic.url) {
            imgSrc = pic.url;
          } else if (pic.image) {
            imgSrc = pic.image;
          }

          return (
            <div
              key={index}
              className="border-2 border-gray-300 rounded-md p-2 bg-white shadow-sm"
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={`Picture ${index + 1}`}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-500 text-xs">
                  Image not found
                </div>
              )}
              <p className="text-center text-xs mt-1 font-medium">
                {index + 1}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-[#212529] mb-4">
        Generate Picture Login Code
      </h2>
      <p className="text-[#64748B] mb-4">
        Generate a picture sequence for young students (Grades 1-3)
      </p>

      {codeData ? (
        <div className="text-center">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Picture Sequence:</h3>

            {renderPictureSequence(codeData.pictures)}

            <div className="text-sm text-gray-500 mt-6 mb-4">
              This picture sequence will expire in 15 minutes
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
              <ol className="text-sm text-left list-decimal pl-5 space-y-1">
                <li>Show the student this exact sequence of pictures</li>
                <li>
                  On the login screen, they should select these pictures in
                  order
                </li>
                <li>
                  If they select correctly, they'll be logged in automatically
                </li>
              </ol>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Student: <span className="font-semibold">{studentEmail}</span>
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerateNew}
              className="py-2 px-4 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
            >
              Generate Another Sequence
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          <div>
            <label
              htmlFor="student-email"
              className="block text-[#64748B] mb-1"
            >
              Student Email
            </label>
            <input
              type="email"
              id="student-email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F6BA18]"
              placeholder="Enter student email"
            />
          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="flex items-center justify-center min-w-[14rem] px-6 py-3 
                font-semibold rounded-md transition-colors duration-300
                text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529]
                disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
              disabled={isLoading}
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
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Picture Code"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PictureCodeGenerator;
