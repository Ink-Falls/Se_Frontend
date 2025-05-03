const validateEmail = (email) => {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "edu.ph",
    "aralkademy.com",
  ];

  const domain = email.split("@")[1].toLowerCase();
  if (
    !allowedDomains.some(
      (allowedDomain) =>
        domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
    )
  ) {
    return "Please use a valid email domain";
  }

  return null;
};

const validatePassword = (password, isLoginForm = false) => {
  if (!password) {
    return "Password is required";
  }

  // For login form, we only check if password exists
  if (isLoginForm) {
    return null;
  }

  // For registration/enrollment forms, check password strength
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter";
  }

  return null;
};

const validateName = (name, fieldName) => {
  if (!name.trim()) {
    return `${fieldName} is required`;
  }
  // Updated regex to allow ñ/Ñ and other valid name characters
  if (!/^[a-zA-ZñÑ\s'-]{2,30}$/.test(name)) {
    return `${fieldName} must at least be 2 characters long and can only contain letters`;
  }
  return null;
};

const validateMiddleInitial = (mi) => {
  if (mi && !/^[A-ZÑ]{1,2}$/.test(mi)) {
    return "Middle initial must be 1-2 uppercase letters";
  }
  return null;
};

const validateContactNo = (contactNo) => {
  const cleanedContactNo = contactNo.replace(/[-\s()]/g, "");
  if (!cleanedContactNo) {
    return "Contact number is required";
  }
  if (!cleanedContactNo.startsWith("09")) {
    return "Contact number must start with 09";
  }
  if (cleanedContactNo.length !== 11) {
    return "Contact number must be 11 digits";
  }
  return null;
};

const validateBirthDate = (date) => {
  if (!date) {
    return "Birth date is required";
  }
  const birthDate = new Date(date);
  // Create mutable date object that can be modified
  const currentDate = new Date();
  const today = new Date(currentDate.setHours(0, 0, 0, 0));

  if (birthDate > today) {
    return "Birth date cannot be in the future";
  }

  // Calculate age using the mutable date
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Adjust age if birthday hasn't occurred this year
  const adjustedAge =
    monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  if (adjustedAge < 6) {
    return "The minimum age is 6 years old";
  }

  return null;
};

const validateConfirmPassword = (confirmPassword, password) => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }
  if (confirmPassword !== password) {
    return "Passwords do not match";
  }
  return null;
};

export {
  validateEmail,
  validatePassword,
  validateName,
  validateMiddleInitial,
  validateContactNo,
  validateBirthDate,
  validateConfirmPassword,
};
