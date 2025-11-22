import UsersDao from "./dao.js";

export default function UserRoutes(app, db) {
  const dao = UsersDao(db);

  // CREATE USER (optional)
  const createUser = (req, res) => {
    const newUser = dao.createUser(req.body);
    res.json(newUser);
  };

  // DELETE USER (optional)
  const deleteUser = (req, res) => {
    dao.deleteUser(req.params.userId);
    res.sendStatus(200);
  };

  // FIND ALL USERS
  const findAllUsers = (req, res) => {
    res.json(dao.findAllUsers());
  };

  // FIND USER BY ID
  const findUserById = (req, res) => {
    const user = dao.findUserById(req.params.userId);
    res.json(user);
  };

  // ⭐ SIGNUP — create user + store in session
  const signup = (req, res) => {
    const existing = dao.findUserByUsername(req.body.username);
    if (existing) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }

    const currentUser = dao.createUser(req.body);
    req.session["currentUser"] = currentUser; // ⭐ store in session
    res.json(currentUser);
  };

  // ⭐ SIGNIN — find user + store in session
  const signin = (req, res) => {
    const { username, password } = req.body;

    const currentUser = dao.findUserByCredentials(username, password);

    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "Unable to login. Try again later." });
    }

    req.session["currentUser"] = currentUser; // ⭐ save session
    res.json(currentUser);
  };

  // ⭐ PROFILE — get logged-in user from session
  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];

    if (!currentUser) {
      return res.sendStatus(401); // unauthorized
    }

    res.json(currentUser);
  };

  // ⭐ SIGNOUT — destroy session
  const signout = (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  };

  // ⭐ UPDATE USER — update DB + sync session
  const updateUser = (req, res) => {
    const userId = req.params.userId;

    dao.updateUser(userId, req.body);

    const currentUser = dao.findUserById(userId);

    req.session["currentUser"] = currentUser; // ⭐ keep session updated

    res.json(currentUser);
  };

  // ROUTES
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);

  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);
}
