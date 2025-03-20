import React, { createContext, useState, useContext } from 'react';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => useContext(CourseContext);
