import React, { useContext } from 'react';
import { SidebarExpand } from "./Sidebar.jsx" // when dealing with getting date from other .jsx make sure the "export const"
import profile from "../assets/profile2.jpeg"
import { Search } from 'lucide-react';


function Announcement() {

    const { expanded } = useContext(SidebarExpand);


    return (
        //using hidden, hides the right side css style, ie. "hidden sm:block"
        // super important - overflow-x-hidden - do not remove.
        <div className="mt-8 ml-5 mb-8 w-full overflow-x-hidden"> {/* Full width for outer container */}
            {/* Flex container for Course Name/Code and Profile */}
            {/* border-2 border-red-500 */}
            <div className="flex flex-col md:flex-row justify-between items-center mr-4 p-4 rounded-lg" style={{ width: '100%' }}> {/* Adjusted layout for responsive */}
                {/* Course Name and Code */}
                <div className="mb-4 md:mb-0"> {/* Added bottom margin for small screens */}
                    <h1 className="text-3xl font-extrabold mb-1 font-['poppins']">Course Name</h1>
                    <h2 className="text-xl font-semibold mb-2 font-['poppins']">Course Code</h2>
                </div>

                {/* Search and Info */}
                <div className="flex flex-col lg:flex-row items-center justify-start sm:justify-end w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[43%] transition-all duration-300">
                    {/* Full width on mobile */}

                    {/* Search Container */}
                    <div
                        className={`flex items-center border border-gray-300 rounded-md shadow-md mb-4 md:mb-0 w-full sm:w-3/4 md:w-4/6 
                    ${expanded ? "sm:mr-0" : "sm:mr-0"} ${expanded ? "md:mr-0" : "md:mr-4"} ${expanded ? "w-full" : "w-auto"}`}
                        style={{ maxWidth: '400px' }} // Restricts maximum width of this container to prevent overflow
                    >
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className="flex-grow flex-shrink p-2 rounded-md focus:outline-none font-['poppins']"
                            style={{ minWidth: '150px', maxWidth: '100%' }} // Restricts min and max width for responsiveness
                        />
                        <button className="flex items-center justify-center bg-indigo-400 rounded-md p-2">
                            <Search className="text-white" />
                        </button>
                    </div>

                    {/* Profile Information Container */}
                    <div
                        className={`flex items-center transition-all duration-1000 ease-in-out ${expanded ? "sm:ml-0" : "sm:ml-0"} ${expanded ? "md:ml-10" : "md:ml-2"} rounded-2xl border shadow-md border-gray-200 p-2 md:-mr-3 overflow-hidden`}
                        style={{ maxWidth: '500px' }} // Removed whiteSpace nowrap
                    >
                        {!expanded && (
                            <div
                                className="flex flex-col sm:mr-0 md:mr-4 md:px-2 px-1 flex-grow "
                                style={{ minWidth: '0' }} // Allows container to shrink flexibly on small screens
                            >
                                <h4 className="font-semibold sm:text-sm md:text-lg truncate">Satella Vivienne Evernight</h4>
                                <span className="text-sm text-gray-600 truncate">Student</span>
                            </div>
                        )}
                        <img
                            src={profile}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-md flex-shrink-0 " // Prevents shrinking of the image
                            alt="Profile"
                        />
                    </div>
                </div>
            </div>

            {/* Announcements Section */}
            <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all mr-4 ${expanded ? 'w-full' : 'w-full'}`}> {/* Made width responsive */}
                <h3 className="text-xl font-bold ml-2 font-['poppins']">All Announcements</h3>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-2xl shadow-md p-5 transition-all mr-4 mb-5 border border-grey-600 h-content-height" style={{ flex: 1, marginTop: '20px', width: '100%' }}>
                {/* <h3 className="text-xl font-bold ml-2 font-['poppins'] mb-7">Remaining Space</h3> */}

                {/* Container for announcements with max height and scrolling */}
                <div className="overflow-y-auto max-h-scroll-height"> {/* Set max height for scrolling */}


                    {/* Additional content goes here */}
                    <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center"> {/* Main container for responsive layout */}

                            {/* Row for checkbox and image */}
                            <div className="flex items-center mb-4 sm:mb-0 sm:mr-11"> {/* Adds responsive spacing between rows */}
                                <input
                                    type="checkbox"
                                    className="w-8 h-8 text-grey-600 border-grey-300 rounded checked:ring-grey-500 mr-2 flex-none" // Added margin-right for spacing
                                />

                                {/* Vertical line */}
                                <div className="w-px bg-gray-300 mx-2 h-10 flex-none" /> {/* Only shows on larger screens */}

                                <img src={profile} className="w-12 h-12 rounded-md flex-shrink-0 ml-5" /> {/* Keeps image from shrinking */}
                            </div>

                            {/* Text content row */}
                            <div className="flex flex-col ml-0 sm:ml-4 w-full"> {/* Added div for spacing and text wrap */}
                                <h3 className="md:text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
                                <span className="text-sm sm:text-xs text-gray-600 w-full sm:max-w-[60%] truncate overflow-hidden">
                                    Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.
                                    Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.
                                    Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.
                                </span>
                            </div>
                        </div>
                    </div>



                    {/* Repeat announcement items here */}

                </div>
            </div>

        </div>

    );
}

export default Announcement;

//You may use this as test for announcement contents!
// {/* Additional content goes here */}
// <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
// <div className="flex sm:flex-row flex-col items-center"> {/* Added flex for alignment */}
//     <input
//         type="checkbox"
//         className="w-8 h-8 text-grey-600 border-grey-300 rounded checked:ring-grey-500 mr-2 flex-none" // Added margin-right for spacing
//     /> {/* Added checkbox with Tailwind classes */}

//     {/* Vertical line */}
//     <div className="w-px bg-gray-300 mx-2 h-10 mr-8 flex-none" /> {/* Vertical line with height */}

//     <img src={profile} className="w-12 h-12 rounded-md" /> {/* Image without extra margin */}

//     <div className="flex flex-col ml-0 sm:ml-4 w-full border-2 border-yellow-500"> {/* Added div for spacing */}
//         <h3 className="text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
//         <span className="text-sm text-gray-600 max-w-[35%]  truncate overflow-hidden">
//             Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.
//             Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.
//             Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.
//         </span>
//     </div>
// </div>
// </div>