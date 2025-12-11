import mongoose from "mongoose";
import quizSchema from "./schema.js";

const QuizModel = mongoose.model("quizzes", quizSchema);
export default QuizModel;
