// Kambaz/Assignments/dao.js
import { v4 as uuidv4 } from "uuid";

export default function AssignmentsDao(db) {
  function findAllAssignments() {
    return db.assignments;
  }

  function findAssignmentsForCourse(courseId) {
    return db.assignments.filter((a) => a.course === courseId);
  }

  function createAssignment(assignment) {
    const newAssignment = { _id: uuidv4(), ...assignment };
    db.assignments.push(newAssignment);
    return newAssignment;
  }

  function updateAssignment(assignmentId, assignmentUpdates) {
    const index = db.assignments.findIndex((a) => a._id === assignmentId);
    if (index === -1) return null;
    db.assignments[index] = { ...db.assignments[index], ...assignmentUpdates };
    return db.assignments[index];
  }

  function deleteAssignment(assignmentId) {
    const index = db.assignments.findIndex((a) => a._id === assignmentId);
    if (index === -1) return false;
    db.assignments.splice(index, 1);
    return true;
  }

  return {
    findAllAssignments,
    findAssignmentsForCourse,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
