const TestAttempt = require("../model/TestAttempt");
const Test = require("../model/Test");
const User = require("../model/User");
const generateResultPdf = require("../UTILS/resultPdf");

exports.downloadResultPdf = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findById(attemptId).populate(
      "answers.questionId",
      "title description",
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    if (attempt.status !== "SUBMITTED") {
      return res.status(400).json({
        success: false,
        message: "Test not submitted yet",
      });
    }

    const test = await Test.findById(attempt.testId);

    const user = await User.findById(req.user.id);

    const userName = user?.name || user?.userName || user?.email || "Candidate";

    const totalTCs = attempt.answers.reduce(
      (sum, ans) => sum + (ans.totalTCs || 0),
      0,
    );

    const passedTCs = attempt.answers.reduce(
      (sum, ans) => sum + (ans.passedTCs || 0),
      0,
    );

    const data = {
      userName,
      testTitle: test.title,
      percentage: attempt.score,
      passedTCs,
      totalTCs,
      message:
        attempt.score === 100
          ? "Outstanding!"
          : attempt.score >= 80
            ? "Great Job!"
            : attempt.score >= 60
              ? "Good effort"
              : "Need more practice!",
      answers: attempt.answers,
    };

    generateResultPdf(res, data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
