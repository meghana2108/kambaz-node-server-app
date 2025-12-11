import QuizModel from "./model.js";

export async function createQuiz(quiz) {
  if (!quiz._id) {
    const randomId = `Q${Date.now().toString().slice(-6)}`;
    quiz._id = randomId;
  }
  const created = await QuizModel.create(quiz);
  return created.toObject();
}

export function findQuizzesForCourse(courseId) {
  return QuizModel.find({ course: courseId }).lean();
}

export function findQuizById(quizId) {
  return QuizModel.findOne({ _id: quizId }).lean();
}

export async function updateQuiz(quizId, quizUpdates) {
  const updated = await QuizModel.findOneAndUpdate(
    { _id: quizId },
    quizUpdates,
    { new: true }
  );
  return updated;
}

export function deleteQuiz(quizId) {
  return QuizModel.deleteOne({ _id: quizId });
}

export async function addQuestionToQuiz(quizId, question) {
  if (!question._id) {
    question._id = `QST${Date.now().toString().slice(-8)}`;
  }

  const quiz = await QuizModel.findOne({ _id: quizId });
  if (!quiz) return null;

  quiz.questions.push(question);

  // Recalculate total points
  quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  await quiz.save();
  return quiz.toObject();
}

export async function updateQuestionInQuiz(
  quizId,
  questionId,
  questionUpdates
) {
  const quiz = await QuizModel.findOne({ _id: quizId });
  if (!quiz) return null;

  const questionIndex = quiz.questions.findIndex((q) => q._id === questionId);
  if (questionIndex === -1) return null;

  quiz.questions[questionIndex] = {
    ...quiz.questions[questionIndex].toObject(),
    ...questionUpdates,
  };

  // Recalculate total points
  quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  await quiz.save();
  return quiz.toObject();
}

export async function deleteQuestionFromQuiz(quizId, questionId) {
  const quiz = await QuizModel.findOne({ _id: quizId });
  if (!quiz) return null;

  quiz.questions = quiz.questions.filter((q) => q._id !== questionId);

  // Recalculate total points
  quiz.points = quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  await quiz.save();
  return quiz.toObject();
}
