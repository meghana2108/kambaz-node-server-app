import { v4 as uuidv4 } from "uuid";

export default function ModulesDao(db) {
  // Find modules for a course
  function findModulesForCourse(courseId) {
    return db.modules.filter((module) => module.course === courseId);
  }

  // Create module
  function createModule(module) {
    const newModule = { ...module, _id: uuidv4() };
    db.modules = [...db.modules, newModule];
    return newModule;
  }

  // Delete module
  function deleteModule(moduleId) {
    db.modules = db.modules.filter((module) => module._id !== moduleId);
    return { status: "ok" };
  }

  // ⭐ UPDATE module (NEW)
  function updateModule(moduleId, moduleUpdates) {
    const module = db.modules.find((m) => m._id === moduleId);
    if (!module) return null;

    Object.assign(module, moduleUpdates);
    return module;
  }

  return {
    findModulesForCourse,
    createModule,
    deleteModule,
    updateModule,
  };
}
