import QuizAttemptModel from "./model.js";

export async function createAttempt(attempt) {
  if (!attempt._id) {
    const randomId = `ATT${Date.now().toString().slice(-8)}`;
    attempt._id = randomId;
  }
  const created = await QuizAttemptModel.create(attempt);
  return created.toObject();
}

export function findAttemptsForQuiz(quizId) {
  return QuizAttemptModel.find({ quiz: quizId }).lean();
}

export function findAttemptsForUserAndQuiz(userId, quizId) {
  return QuizAttemptModel.find({ user: String(userId), quiz: quizId })
    .sort({ attemptNumber: -1 })
    .lean();
}

export function findAttemptById(attemptId) {
  return QuizAttemptModel.findOne({ _id: attemptId }).lean();
}

export async function getAttemptCount(userId, quizId) {
  return await QuizAttemptModel.countDocuments({
    user: String(userId),
    quiz: quizId,
  });
}

export async function getLatestAttempt(userId, quizId) {
  return await QuizAttemptModel.findOne({
    user: String(userId),
    quiz: quizId,
  })
    .sort({ attemptNumber: -1 })
    .lean();
}

export async function updateAttempt(attemptId, attemptUpdates) {
  const updated = await QuizAttemptModel.findOneAndUpdate(
    { _id: attemptId },
    attemptUpdates,
    { new: true }
  );
  return updated;
}

export function deleteAttempt(attemptId) {
  return QuizAttemptModel.deleteOne({ _id: attemptId });
}
