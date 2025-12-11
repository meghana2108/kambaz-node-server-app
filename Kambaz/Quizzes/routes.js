import * as quizzesDao from "./dao.js";

export default function QuizzesRoutes(app) {
  app.get("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const { courseId } = req.params;
      const currentUser = req.session["currentUser"];

      let quizzes = await quizzesDao.findQuizzesForCourse(courseId);

      if (currentUser?.role === "STUDENT") {
        quizzes = quizzes.filter((quiz) => quiz.published);
      }

      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({
        message: "Error fetching quizzes",
        error: error.message,
      });
    }
  });

  // Get a single quiz by ID
  app.get("/api/quizzes/:quizId", async (req, res) => {
    try {
      const { quizId } = req.params;
      const quiz = await quizzesDao.findQuizById(quizId);

      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Recalculate points from questions
      quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({
        message: "Error fetching quiz",
        error: error.message,
      });
    }
  });

  // Create a new quiz
  app.post("/api/courses/:courseId/quizzes", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];

      if (
        !currentUser ||
        (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")
      ) {
        return res.status(403).json({
          message: "Only faculty can create quizzes",
        });
      }

      const { courseId } = req.params;
      const quiz = {
        ...req.body,
        course: courseId,
      };

      const newQuiz = await quizzesDao.createQuiz(quiz);
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({
        message: "Error creating quiz",
        error: error.message,
      });
    }
  });

  // Update a quiz
  app.put("/api/quizzes/:quizId", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];

      if (
        !currentUser ||
        (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")
      ) {
        return res.status(403).json({
          message: "Only faculty can update quizzes",
        });
      }

      const { quizId } = req.params;
      const quizUpdates = req.body;

      const updatedQuiz = await quizzesDao.updateQuiz(quizId, quizUpdates);

      if (!updatedQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({
        message: "Error updating quiz",
        error: error.message,
      });
    }
  });

  // Delete a quiz
  app.delete("/api/quizzes/:quizId", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];

      if (
        !currentUser ||
        (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")
      ) {
        return res.status(403).json({
          message: "Only faculty can delete quizzes",
        });
      }

      const { quizId } = req.params;
      const status = await quizzesDao.deleteQuiz(quizId);

      if (status.deletedCount === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({
        message: "Error deleting quiz",
        error: error.message,
      });
    }
  });

  // Add a question to a quiz
  app.post("/api/quizzes/:quizId/questions", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];

      if (
        !currentUser ||
        (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")
      ) {
        return res.status(403).json({
          message: "Only faculty can add questions",
        });
      }

      const { quizId } = req.params;
      const question = req.body;

      const updatedQuiz = await quizzesDao.addQuestionToQuiz(quizId, question);

      if (!updatedQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error adding question:", error);
      res.status(500).json({
        message: "Error adding question",
        error: error.message,
      });
    }
  });

  // Update a question in a quiz
  app.put("/api/quizzes/:quizId/questions/:questionId", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];

      if (
        !currentUser ||
        (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")
      ) {
        return res.status(403).json({
          message: "Only faculty can update questions",
        });
      }

      const { quizId, questionId } = req.params;
      const questionUpdates = req.body;

      const updatedQuiz = await quizzesDao.updateQuestionInQuiz(
        quizId,
        questionId,
        questionUpdates
      );

      if (!updatedQuiz) {
        return res.status(404).json({ message: "Quiz or question not found" });
      }

      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({
        message: "Error updating question",
        error: error.message,
      });
    }
  });

  // Delete a question from a quiz
  app.delete("/api/quizzes/:quizId/questions/:questionId", async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];

      if (
        !currentUser ||
        (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN")
      ) {
        return res.status(403).json({
          message: "Only faculty can delete questions",
        });
      }

      const { quizId, questionId } = req.params;

      const updatedQuiz = await quizzesDao.deleteQuestionFromQuiz(
        quizId,
        questionId
      );

      if (!updatedQuiz) {
        return res.status(404).json({ message: "Quiz or question not found" });
      }

      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({
        message: "Error deleting question",
        error: error.message,
      });
    }
  });
}
