const Questions = require("../model/Questions");
const { evaluateMCQ } = require("../services/mcqEvaluator");

exports.testEvaluateMCQ = async (req, res) => {
  try {
    const { questionId, selectedOption } = req.body;

    if (!questionId || selectedOption === undefined) {
      return res.status(400).json({
        success: false,
        message: "questionId and selectedOption are required",
      });
    }

    const question = await Questions.findById(questionId);

    if (!question || !question.isActive) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.questionType !== "MCQ") {
      return res.status(400).json({
        success: false,
        message: "This question is not an MCQ",
      });
    }

    const { isCorrect, score } = evaluateMCQ({
      selectedOption,
      correctAnswer: question.correctAnswer,
    });

    return res.status(200).json({
      success: true,
      data: {
        questionId,
        selectedOption,
        correctAnswer: question.correctAnswer,
        isCorrect,
        score,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
