import * as attemptDao from "./dao.js";
import * as quizzesDao from "../Quizzes/dao.js";

export default function QuizAttemptRoutes(app) {
  // Get all attempts for a user on a specific quiz
  app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId =
        currentUser._id || currentUser.username || currentUser.loginId;
      const attempts = await attemptDao.findAttemptsForUserAndQuiz(
        userId,
        quizId
      );

      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({
        message: "Error fetching attempts",
        error: error.message,
      });
    }
  });

  // Get latest attempt for a user on a specific quiz
  app.get("/api/quizzes/:quizId/attempts/latest", async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId =
        currentUser._id || currentUser.username || currentUser.loginId;
      const attempt = await attemptDao.getLatestAttempt(userId, quizId);

      res.json(attempt || null);
    } catch (error) {
      console.error("Error fetching latest attempt:", error);
      res.status(500).json({
        message: "Error fetching latest attempt",
        error: error.message,
      });
    }
  });

  // Start a new attempt
  app.post("/api/quizzes/:quizId/attempts", async (req, res) => {
    try {
      const { quizId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId =
        currentUser._id || currentUser.username || currentUser.loginId;

      // Get quiz to check attempt limits
      const quiz = await quizzesDao.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Check if quiz is published
      if (!quiz.published && currentUser.role === "STUDENT") {
        return res.status(403).json({ message: "Quiz is not published" });
      }

      // Check attempt count
      const attemptCount = await attemptDao.getAttemptCount(userId, quizId);
      if (!quiz.multipleAttempts && attemptCount > 0) {
        return res
          .status(403)
          .json({ message: "Multiple attempts not allowed" });
      }

      if (quiz.multipleAttempts && attemptCount >= quiz.howManyAttempts) {
        return res.status(403).json({
          message: `Maximum attempts (${quiz.howManyAttempts}) reached`,
        });
      }

      // Create new attempt
      const attempt = {
        quiz: quizId,
        user: String(userId),
        course: quiz.course,
        attemptNumber: attemptCount + 1,
        answers: [],
        score: 0,
        completed: false,
        startedAt: new Date(),
      };

      const newAttempt = await attemptDao.createAttempt(attempt);
      res.status(201).json(newAttempt);
    } catch (error) {
      console.error("Error creating attempt:", error);
      res.status(500).json({
        message: "Error creating attempt",
        error: error.message,
      });
    }
  });

  // Submit/complete an attempt
  app.put("/api/attempts/:attemptId/submit", async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { answers } = req.body;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attempt = await attemptDao.findAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }

      const userId =
        currentUser._id || currentUser.username || currentUser.loginId;
      if (String(attempt.user) !== String(userId)) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (attempt.completed) {
        return res.status(400).json({ message: "Attempt already completed" });
      }

      // Get quiz to grade answers
      const quiz = await quizzesDao.findQuizById(attempt.quiz);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }

      // Grade the answers
      let totalScore = 0;
      const gradedAnswers = answers.map((answer) => {
        const question = quiz.questions.find(
          (q) => q._id === answer.questionId
        );
        if (!question) return answer;

        let isCorrect = false;
        let pointsEarned = 0;

        switch (question.type) {
          case "MULTIPLE_CHOICE":
            const correctChoice = question.choices?.find((c) => c.isCorrect);
            isCorrect = answer.answer === correctChoice?.text;
            pointsEarned = isCorrect ? question.points : 0;
            break;

          case "TRUE_FALSE":
            isCorrect = answer.answer === question.correctAnswer;
            pointsEarned = isCorrect ? question.points : 0;
            break;

          case "FILL_IN_BLANK":
            const answerText = String(answer.answer || "").trim();
            if (question.caseSensitive) {
              isCorrect =
                question.possibleAnswers?.includes(answerText) || false;
            } else {
              isCorrect =
                question.possibleAnswers?.some(
                  (pa) => pa.toLowerCase() === answerText.toLowerCase()
                ) || false;
            }
            pointsEarned = isCorrect ? question.points : 0;
            break;
        }

        totalScore += pointsEarned;

        return {
          ...answer,
          isCorrect,
          pointsEarned,
        };
      });

      // Update attempt
      const updatedAttempt = await attemptDao.updateAttempt(attemptId, {
        answers: gradedAnswers,
        score: totalScore,
        completed: true,
        submittedAt: new Date(),
      });

      res.json(updatedAttempt);
    } catch (error) {
      console.error("Error submitting attempt:", error);
      res.status(500).json({
        message: "Error submitting attempt",
        error: error.message,
      });
    }
  });

  // Get a specific attempt (for reviewing)
  app.get("/api/attempts/:attemptId", async (req, res) => {
    try {
      const { attemptId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attempt = await attemptDao.findAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }

      const userId =
        currentUser._id || currentUser.username || currentUser.loginId;

      // Students can only see their own attempts, faculty can see all
      if (
        currentUser.role === "STUDENT" &&
        String(attempt.user) !== String(userId)
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }

      res.json(attempt);
    } catch (error) {
      console.error("Error fetching attempt:", error);
      res.status(500).json({
        message: "Error fetching attempt",
        error: error.message,
      });
    }
  });
}
