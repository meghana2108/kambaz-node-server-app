// Kambaz/Assignments/routes.js
import AssignmentsDao from "./dao.js";

export default function AssignmentsRoutes(app, db) {
  const dao = AssignmentsDao(db);

  // GET all assignments
  app.get("/api/assignments", (req, res) => {
    res.json(dao.findAllAssignments());
  });

  // GET assignments for a course
  app.get("/api/courses/:cid/assignments", (req, res) => {
    const { cid } = req.params;
    res.json(dao.findAssignmentsForCourse(cid));
  });

  // POST create assignment
  app.post("/api/assignments", (req, res) => {
    const assignment = dao.createAssignment(req.body);
    res.json(assignment);
  });

  // PUT update assignment
  app.put("/api/assignments/:aid", (req, res) => {
    const { aid } = req.params;
    const updated = dao.updateAssignment(aid, req.body);
    updated ? res.json(updated) : res.status(404).send("Not found");
  });

  // DELETE assignment
  app.delete("/api/assignments/:aid", (req, res) => {
    const { aid } = req.params;
    const success = dao.deleteAssignment(aid);
    success ? res.sendStatus(200) : res.status(404).send("Not found");
  });
}
