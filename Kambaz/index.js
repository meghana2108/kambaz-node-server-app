import db from "./Database/index.js";
import UserRoutes from "./Users/routes.js";
import CourseRoutes from "./Courses/routes.js";
import ModulesRoutes from "./Modules/routes.js";
import AssignmentsRoutes from "./Assignments/routes.js";

export default function Kambaz(app) {
  // ⭐ USERS API
  UserRoutes(app, db);

  // ⭐ COURSES API (CRUD for courses + enrolled courses)
  CourseRoutes(app, db);

  // ⭐ MODULES API (CRUD for modules inside a course)
  ModulesRoutes(app, db);

  AssignmentsRoutes(app, db);
}
