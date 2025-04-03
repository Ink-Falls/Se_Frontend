import adminIcon from "/src/assets/images/icons/admin_icon.png";
import booksIcon from "/src/assets/images/icons/books_icon.png";
import learnerIcon from "/src/assets/images/icons/learner_icon.png";
import schoolIcon from "/src/assets/images/icons/school_icon.png";

export const getUserProfileImage = (role = "learner") => {
  switch (role?.toLowerCase()) {
    case "admin":
      return adminIcon;
    case "teacher":
      return schoolIcon;
    case "student_teacher":
      return booksIcon;
    case "learner":
    default:
      return learnerIcon;
  }
};
