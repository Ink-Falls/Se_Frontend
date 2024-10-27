import React, { useContext } from 'react';
import { SidebarExpand } from "./Sidebar.jsx" // when dealing with getting date from other .jsx make sure the "export const"
import profile from "../assets/profile2.jpeg"
import { Search } from 'lucide-react';


function Announcement() {

    const { expanded } = useContext(SidebarExpand);


    return (
        <div className="mt-8 ml-5 mb-8 w-full"> {/* Full width for outer container */}
            {/* Flex container for Course Name/Code and Profile */}
            {/* border-2 border-red-500 */}
            <div className="flex flex-col md:flex-row justify-between items-center mr-4 p-4 rounded-lg " style={{ width: '100%' }}> {/* Adjusted layout for responsive */}
                {/* Course Name and Code */}
                <div className="mb-4 md:mb-0"> {/* Added bottom margin for small screens */}
                    <h1 className="text-3xl font-extrabold mb-1 font-['poppins']">Course Name</h1>
                    <h2 className="text-xl font-semibold mb-2 font-['poppins']">Course Code</h2>
                </div>

                {/* Search and Info */}
                <div className="flex items-center w-full md:w-auto "> {/* Full width on mobile */}

                    {/* Search Bar */}
                    <div className="flex items-center border border-gray-300 rounded-md shadow-md overflow-hidden mr-8" style={{ width: '400px' }}>
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className="flex-grow p-2 rounded-md focus:outline-none font-['poppins']"
                        />
                        <button className="flex items-center justify-center bg-indigo-400 rounded-md p-2">
                            <Search className="text-white" />
                        </button>
                    </div>

                    {/* Profile Information Container */}
                    <div className={`flex items-center transition-all ${expanded ? "ml-3" : "w-auto"} rounded-2xl border shadow-md border-gray-200 p-2 -mr-3`}>
                        {!expanded && (
                            <div className="flex-grow overflow-hidden mr-4 px-2 ">
                                <h4 className="font-semibold text-lg">Satella Vivienne Evernight</h4>
                                <span className="text-sm text-gray-600">Student</span>
                            </div>
                        )}
                        <img src={profile} className="w-12 h-12 rounded-md" alt="Profile" />
                    </div>
                </div>
            </div>

            {/* Announcements Section */}
            <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all mr-4 ${expanded ? 'w-full' : 'w-full'}`}> {/* Made width responsive */}
                <h3 className="text-xl font-bold ml-2 font-['poppins']">All Announcements</h3>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-2xl shadow-md p-5 transition-all mr-4 mb-5 border border-grey-600 h-content-height" style={{ flex: 1, marginTop: '20px', width: '100%' }}>
                <h3 className="text-xl font-bold ml-2 font-['poppins'] mb-7">Remaining Space</h3>

                {/* Container for announcements with max height and scrolling */}
                <div className="overflow-y-auto max-h-scroll-height"> {/* Set max height for scrolling */}
            
                    {/* Additional content goes here */}
                    <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
                        <div className="flex items-center"> {/* Added flex for alignment */}
                            <input
                                type="checkbox"
                                className="w-8 h-8 text-grey-600 border-grey-300 rounded checked:ring-grey-500 mr-2 " // Added margin-right for spacing
                            /> {/* Added checkbox with Tailwind classes */}

                            {/* Vertical line */}
                            <div className="w-px bg-gray-300 mx-2 h-10 mr-8" /> {/* Vertical line with height */}

                            <img src={profile} className="w-12 h-12 rounded-md" /> {/* Image without extra margin */}

                            <div className="ml-4"> {/* Added div for spacing */}
                                <h3 className="text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
                                <span className="text-sm text-gray-600">Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.</span>
                            </div>
                        </div>
                    </div>
                    {/* </label> */}

                    {/* Additional content goes here */}
                    <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
                        <div className="flex items-center"> {/* Added flex for alignment */}
                            <input
                                type="checkbox"
                                className="w-8 h-8 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" // Added margin-right for spacing
                            /> {/* Added checkbox with Tailwind classes */}

                            {/* Vertical line */}
                            <div className="w-px bg-gray-300 mx-2 h-10 mr-8" /> {/* Vertical line with height */}

                            <img src={profile} className="w-12 h-12 rounded-md" /> {/* Image without extra margin */}

                            <div className="ml-4"> {/* Added div for spacing */}
                                <h3 className="text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
                                <span className="text-sm text-gray-600">Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional content goes here */}
                    <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
                        <div className="flex items-center"> {/* Added flex for alignment */}
                            <input
                                type="checkbox"
                                className="w-8 h-8 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" // Added margin-right for spacing
                            /> {/* Added checkbox with Tailwind classes */}

                            {/* Vertical line */}
                            <div className="w-px bg-gray-300 mx-2 h-10 mr-8" /> {/* Vertical line with height */}

                            <img src={profile} className="w-12 h-12 rounded-md" /> {/* Image without extra margin */}

                            <div className="ml-4"> {/* Added div for spacing */}
                                <h3 className="text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
                                <span className="text-sm text-gray-600">Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional content goes here */}
                    <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
                        <div className="flex items-center"> {/* Added flex for alignment */}
                            <input
                                type="checkbox"
                                className="w-8 h-8 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" // Added margin-right for spacing
                            /> {/* Added checkbox with Tailwind classes */}

                            {/* Vertical line */}
                            <div className="w-px bg-gray-300 mx-2 h-10 mr-8" /> {/* Vertical line with height */}

                            <img src={profile} className="w-12 h-12 rounded-md" /> {/* Image without extra margin */}

                            <div className="ml-4"> {/* Added div for spacing */}
                                <h3 className="text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
                                <span className="text-sm text-gray-600">Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional content goes here */}
                    <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
                        <div className="flex items-center"> {/* Added flex for alignment */}
                            <input
                                type="checkbox"
                                className="w-8 h-8 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" // Added margin-right for spacing
                            /> {/* Added checkbox with Tailwind classes */}

                            {/* Vertical line */}
                            <div className="w-px bg-gray-300 mx-2 h-10 mr-8" /> {/* Vertical line with height */}

                            <img src={profile} className="w-12 h-12 rounded-md" /> {/* Image without extra margin */}

                            <div className="ml-4"> {/* Added div for spacing */}
                                <h3 className="text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
                                <span className="text-sm text-gray-600">Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional content goes here */}
                    <div className={`bg-gray-100 rounded-2xl shadow-md p-5 transition-all overflow-hidden mr-4 border border-grey-600 mb-5 has-[:checked]:bg-indigo-100`}>
                        <div className="flex items-center"> {/* Added flex for alignment */}
                            <input
                                type="checkbox"
                                className="w-8 h-8 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2" // Added margin-right for spacing
                            /> {/* Added checkbox with Tailwind classes */}

                            {/* Vertical line */}
                            <div className="w-px bg-gray-300 mx-2 h-10 mr-8" /> {/* Vertical line with height */}

                            <img src={profile} className="w-12 h-12 rounded-md" /> {/* Image without extra margin */}

                            <div className="ml-4"> {/* Added div for spacing */}
                                <h3 className="text-xl font-bold font-['poppins'] -mb-1">All Announcements</h3>
                                <span className="text-sm text-gray-600">Lorem ipsum dolor sit amet. Vel facilis ipsum ab repudiandae expedita ea galisum sequi At suscipit magnam ut unde quaerat ut saepe ullam.</span>
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