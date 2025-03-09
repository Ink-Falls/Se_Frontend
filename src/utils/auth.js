const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  // Add token validation logic here if needed
  return true;
};

const clearAuthData = () => {
  localStorage.removeItem("token");
  // Clear any other auth-related data here
};

export { isAuthenticated, clearAuthData };
