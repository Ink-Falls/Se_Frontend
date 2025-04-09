const courseImages = [
  "/courses/course_pic_1.png",
  "/courses/course_pic_2.png",
  "/courses/course_pic_3.png",
  "/courses/course_pic_4.png",
  "/courses/course_pic_5.png",
  "/courses/course_pic_6.png",
  "/courses/course_pic_12.png",
  "/courses/course_pic_13.png",
  "/courses/course_pic_14.png",
  "/courses/course_pic_15.png",
  "/courses/course_pic_16.png",
  "/courses/course_pic_17.png",
  "/courses/course_pic_18.png",
  "/courses/course_pic_19.png",
  "/courses/course_pic_20.png",
  "/courses/course_pic_21.png",
];

let lastImageIndex = -1;

export const getRandomCourseImage = (courseName = "") => {
  // Get all currently assigned images
  const assignedImages = JSON.parse(
    localStorage.getItem("courseImages") || "{}"
  );

  if (!courseName) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * courseImages.length);
    } while (randomIndex === lastImageIndex && courseImages.length > 1);

    lastImageIndex = randomIndex;
    return courseImages[randomIndex];
  }

  // If this course already has an assigned image, return it
  if (assignedImages[courseName]) {
    return assignedImages[courseName];
  }

  // Get all currently used images
  const usedImages = Object.values(assignedImages);

  // Find available images that aren't currently assigned
  const availableImages = courseImages.filter(
    (img) => !usedImages.includes(img)
  );

  // If there are available unique images, use one of those
  if (availableImages.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const assignedImage = availableImages[randomIndex];
    assignedImages[courseName] = assignedImage;
  } else {
    // If all images are used, fall back to completely random selection
    const randomIndex = Math.floor(Math.random() * courseImages.length);
    const assignedImage = courseImages[randomIndex];
    assignedImages[courseName] = assignedImage;
  }

  // Store the updated assignments
  localStorage.setItem("courseImages", JSON.stringify(assignedImages));
  return assignedImages[courseName];
};
