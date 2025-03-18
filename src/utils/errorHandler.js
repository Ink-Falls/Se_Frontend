export const handleAuthError = (error) => {
  if (error.message?.includes('Network Error')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  switch (error.status) {
    case 400:
      return 'Invalid credentials. Please check your email and password.';
    case 401:
      return 'Unauthorized access. Please log in again.';
    case 403:
      return 'Access forbidden. Please check your permissions.';
    case 422:
      return 'Invalid input. Please check your credentials.';
    case 429:
      return 'Too many attempts. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};
