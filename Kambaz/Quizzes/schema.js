import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    type: {
      type: String,
      enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "FILL_IN_BLANK"],
      required: true,
    },
    title: { type: String, required: true },
    points: { type: Number, default: 1 },
    question: { type: String, required: true },
    group: { type: String, default: "General Knowledge" }, // Question group
    // For Multiple Choice
    choices: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],
    // For True/False
    correctAnswer: { type: Boolean },
    // For Fill in Blank
    possibleAnswers: [{ type: String }],
    caseSensitive: { type: Boolean, default: false },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    course: { type: String, required: true, ref: "courses" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    quizType: {
      type: String,
      enum: [
        "GRADED_QUIZ",
        "PRACTICE_QUIZ",
        "GRADED_SURVEY",
        "UNGRADED_SURVEY",
      ],
      default: "GRADED_QUIZ",
    },
    points: { type: Number, default: 0 },
    assignmentGroup: {
      type: String,
      enum: ["QUIZZES", "EXAMS", "ASSIGNMENTS", "PROJECT"],
      default: "QUIZZES",
    },
    shuffleAnswers: { type: Boolean, default: true },
    timeLimit: { type: Number, default: 20 },
    multipleAttempts: { type: Boolean, default: false },
    howManyAttempts: { type: Number, default: 1 },
    showCorrectAnswers: { type: String, default: "IMMEDIATELY" },
    accessCode: { type: String, default: "" },
    oneQuestionAtATime: { type: Boolean, default: true },
    webcamRequired: { type: Boolean, default: false },
    lockQuestionsAfterAnswering: { type: Boolean, default: false },
    dueDate: { type: Date },
    availableDate: { type: Date },
    untilDate: { type: Date },
    published: { type: Boolean, default: false },
    questions: [questionSchema],
  },
  {
    collection: "quizzes",
    _id: false,
    timestamps: true,
  }
);

export default quizSchema;
