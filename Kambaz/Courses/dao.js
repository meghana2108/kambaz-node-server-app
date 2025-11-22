import { v4 as uuidv4 } from "uuid";

export default function CoursesDao(db) {
  function findAllCourses() {
    return db.courses;
  }

  function findCoursesForEnrolledUser(userId) {
    const { courses, enrollments } = db;

    return courses.filter((course) =>
      enrollments.some(
        (enrollment) =>
          enrollment.user === userId && enrollment.course === course._id
      )
    );
  }

  function createCourse(course) {
    const newCourse = {
      _id: uuidv4(), // ALWAYS set ID
      name: course.name || "",
      number: course.number || "",
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      image: course.image || "/images/placeholder.jpg",
      description: course.description || "",
      createdBy: course.createdBy,
    };

    db.courses = [...db.courses, newCourse];
    return newCourse;
  }

  function deleteCourse(courseId) {
    const { courses, enrollments } = db;

    db.courses = courses.filter((course) => course._id !== courseId);
    db.enrollments = enrollments.filter(
      (enrollment) => enrollment.course !== courseId
    );

    return { status: "success" };
  }

  function updateCourse(courseId, updates) {
    const course = db.courses.find((c) => c._id === courseId);
    if (!course) return null;

    // ⚡ FIX: Prevent overwriting _id
    const safeUpdates = {
      ...updates,
      _id: course._id, // protect ID
      name: updates.name ?? course.name,
      number: updates.number ?? course.number,
      description: updates.description ?? course.description,
      image:
        updates.image && updates.image !== ""
          ? updates.image
          : course.image || "/images/placeholder.jpg",
      startDate: updates.startDate ?? course.startDate,
      endDate: updates.endDate ?? course.endDate,
      createdBy: updates.createdBy ?? course.createdBy,
    };

    Object.assign(course, safeUpdates);
    return course;
  }

  return {
    findAllCourses,
    findCoursesForEnrolledUser,
    createCourse,
    deleteCourse,
    updateCourse,
  };
}
