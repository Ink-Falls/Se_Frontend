import React, { useEffect } from 'react'; // Import useEffect
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Enrollment from "./components/Enrollment.jsx";
import NewEnrollment from "./components/NewEnrollment.jsx";
import "./icon.css";
import StudentDashboard from "./components/StudentDashboard.jsx";
import Courses from "./components/Courses.jsx";

function App() {
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    // Inline Logout component
    const Logout = () => {
        const navigate = useNavigate();

        useEffect(() => { // still not working
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
        }, [navigate]); // The dependency array was the issue!

        return null;
    };


    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Enrollment" element={<Enrollment />} />
                <Route path="/Enrollment/New" element={<NewEnrollment />} />
                <Route path="/logout" element={<Logout />} />

                {/* Protected Routes */}
                <Route
                    path="/Home"
                    element={isAuthenticated() ? <Home /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/StudentDashboard"
                    element={isAuthenticated() ? <StudentDashboard /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/courses"
                    element={isAuthenticated() ? <Courses /> : <Navigate to="/login" replace />}
                />
                <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
        </Router>
    );
}

export default App;