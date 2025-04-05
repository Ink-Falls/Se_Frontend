const courseImages = [
  "/src/assets/courses/course_pic_1.jpg",
  "/src/assets/courses/course_pic_2.jpg",
  "/src/assets/courses/course_pic_3.jpg",
  "/src/assets/courses/course_pic_4.jpg",
  "/src/assets/courses/course_pic_5.jpg",
  "/src/assets/courses/course_pic_6.jpg",
];

let lastImageIndex = -1;

export const getRandomCourseImage = () => {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * courseImages.length);
  } while (randomIndex === lastImageIndex && courseImages.length > 1);

  lastImageIndex = randomIndex;
  return courseImages[randomIndex];
};
