const TestAttempt = require("../model/TestAttempt");
const Test = require("../model/Test");
const Questions = require("../model/Questions");
const _ = require("lodash");
const vm = require("vm");

exports.startTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const userId = req.user.id;

    const test = await Test.findOne({ _id: testId, isActive: true });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found or inactive",
      });
    }

    const existingAttempt = await TestAttempt.findOne({
      userId,
      testId,
    });

    if (existingAttempt) {
      if (existingAttempt.status !== "ONGOING") {
        return res.status(403).json({
          success: false,
          message: "You have already completed this test",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          attemptId: existingAttempt._id,
          startTime: existingAttempt.startTime,
          endTime: existingAttempt.endTime,
        },
      });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + test.duration * 60 * 1000);

    const attempt = await TestAttempt.create({
      userId,
      testId,
      startTime,
      endTime,
    });

    return res.status(201).json({
      success: true,
      message: "Test started",
      data: {
        attemptId: attempt._id,
        startTime,
        endTime,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getTestQuestions = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId,
    }).populate({
      path: "testId",
      populate: {
        path: "questionIds",
        select: "title description constraints testCases",
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found",
      });
    }

    if (new Date() > attempt.endTime) {
      attempt.status = "EXPIRED";
      await attempt.save();

      return res.status(403).json({
        success: false,
        message: "Test time has expired",
      });
    }

    if (attempt.status !== "ONGOING") {
      return res.status(403).json({
        success: false,
        message: "Test already submitted or expired",
      });
    }

    const questions = attempt.testId.questionIds.map((q) => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      constraints: q.constraints,
      testCases: q.testCases,
    }));

    return res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        endTime: attempt.endTime,
        questions,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.submitAnswers = async (req, res) => {
  try {
    const { attemptId, questionId } = req.params;
    const { code, language } = req.body;
    const userId = req.user.id;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "code and language are required",
      });
    }

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId,
      status: "ONGOING",
    });

    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired attempt",
      });
    }

    const question = await Questions.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    let passedTCs = 0;
    const totalTCs = question.testCases.length;

    for (const tc of question.testCases) {
      const context = {
        input: tc.input,
        result: null,
      };

      vm.createContext(context);

      const wrappedCode = `
        ${code}
        result = solution(...input);
      `;

      new vm.Script(wrappedCode).runInContext(context, {
        timeout: 1000,
      });

      if (_.isEqual(context.result, tc.output)) {
        passedTCs++;
      }
    }

    attempt.answers = attempt.answers.filter(
      (a) => a.questionId.toString() !== questionId,
    );

    attempt.answers.push({
      questionId,
      code,
      language,
      passedTCs,
      totalTCs,
    });

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Answer saved successfully",
      data: {
        passedTCs,
        totalTCs,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId,
      status: "ONGOING",
    }).populate({
      path: "testId",
      populate: {
        path: "questionIds",
        select: "testCases",
      },
    });

    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: "Test already submitted or invalid",
      });
    }

    let totalTCs = 0;
    attempt.testId.questionIds.forEach((q) => {
      totalTCs += q.testCases.length;
    });

    let passedTCs = 0;
    attempt.answers.forEach((ans) => {
      passedTCs += ans.passedTCs;
    });

    const percentage =
      totalTCs === 0 ? 0 : Math.round((passedTCs / totalTCs) * 100);

    let message = "Need improvement, Practice more";
    if (percentage === 100) message = "Outstanding! Perfect score";
    else if (percentage >= 80) message = "Great job!";
    else if (percentage >= 60) message = "Good effort";

    attempt.score = percentage;
    attempt.status = "SUBMITTED";
    attempt.endTime = new Date();

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Test submitted successfully",
      status: attempt.status,
      result: {
        percentage,
        passedTCs,
        totalTCs,
        performanceMessage: message,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
