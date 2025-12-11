import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: { type: Boolean },
    pointsEarned: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    quiz: { type: String, required: true, ref: "quizzes" },
    user: { type: String, required: true, ref: "users" },
    course: { type: String, required: true, ref: "courses" },
    attemptNumber: { type: Number, required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
  },
  {
    collection: "quizattempts",
    _id: false,
    timestamps: true,
  }
);

quizAttemptSchema.index({ user: 1, quiz: 1 });

export default quizAttemptSchema;
