import mongoose from "mongoose";
import quizAttemptSchema from "./schema.js";

const QuizAttemptModel = mongoose.model("quizattempts", quizAttemptSchema);
export default QuizAttemptModel;
