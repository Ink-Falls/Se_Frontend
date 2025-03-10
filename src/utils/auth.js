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

export const getUserRole = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export { isAuthenticated, clearAuthData };
