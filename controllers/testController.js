const Test = require("../model/Test");
const Questions = require("../model/Questions");
const TestAttempt = require("../model/TestAttempt");

exports.createTest = async (req, res) => {
  try {
    const { category, title, description, duration, questionIds, rules } =
      req.body;
    if (
      !title ||
      !duration ||
      !questionIds ||
      !category ||
      questionIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, duration, category and questions are required",
      });
    }
    const existingTest = await Test.findOne({ title });
    if (existingTest) {
      return res.status(400).json({
        success: false,
        message: "Test with this title already exist",
      });
    }
    const validQuestion = await Questions.find({
      _id: { $in: questionIds },
      isActive: true,
    });
    if (validQuestion.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more questions are invalid or inactive",
      });
    }
    if (
      rules?.minQuestionToAttempt &&
      rules.minQuestionToAttempt > questionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum questions to attempt cannot exceed total questions",
      });
    }

    const test = await Test.create({
      title,
      category,
      description,
      duration,
      questionIds,
      totalQuestions: questionIds.length,
      rules,
      createdBy: req.user.id,
    });
    return res.status(201).json({
      success: true,
      message: "Test Created Successfully",
      data: test,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.getAvailableTests = async (req, res) => {
  try {
    const userId = req.user.id;

    const tests = await Test.find({ isActive: true });
    const attempts = await TestAttempt.find({ userId });

    const map = {};
    attempts.forEach((a) => {
      map[a.testId.toString()] = a;
    });

    const data = tests.map((test) => {
      const attempt = map[test._id.toString()];

      return {
        _id: test._id,
        title: test.title,
        description: test.description,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        rules: test.rules,
        attempt: attempt
          ? {
              _id: attempt._id,
              status: attempt.status,
              score: attempt.score,
            }
          : null,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true })
      .select("title duration totalQuestions rules createdAt")
      .sort({ createdAt: -1 });
    if (!tests) {
      return res.status(404).json({
        success: false,
        message: "Tests Not found",
      });
    }
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getTestById = async (req, res) => {
  try {
    const id = req.params.id;

    const test = await Test.findOne({
      _id: id,
      isActive: true,
    });
    if (!test) {
      return res.status(400).json({
        success: false,
        message: "No Questions available with this id",
      });
    }
    return res.status(200).json({
      success: true,
      data: test,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, duration, questionIds, rules } = req.body;

    const test = await Test.findOne({ _id: id, isActive: true });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test Not Found Or inactive",
      });
    }
    const attemptExists = await TestAttempt.exists({ testId: id });
    if (attemptExists) {
      return res.status(409).json({
        success: false,
        message: "Test cannot be modified once attempts exist",
      });
    }

    if (questionIds && questionIds.length > 0) {
      const validate = await Questions.find({
        _id: { $in: questionIds },
        isActive: true,
      });
      if (validate.length !== questionIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more questions are invalid or inactive",
        });
      }
      test.questionIds = questionIds;
      test.totalQuestions = questionIds.length;
    }
    if (
      rules?.minQuestionToAttempt &&
      rules?.minQuestionToAttempt >
        (test.totalQuestions || test.questionIds.length)
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum questions to attempt cannot exceed total questions",
      });
    }
    if (title) test.title = title;
    if (description) test.description = description;
    if (duration) test.duration = duration;
    if (rules) test.rules = rules;

    await test.save();

    return res.status(200).json({
      success: true,
      message: "Test Updated Successfully",
      data: test,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const id = req.params.id;
    const attemptExists = await TestAttempt.exists({ testId: id });
    if (attemptExists) {
      return res.status(409).json({
        success: false,
        message: "Test cannot be modified once attempts exist",
      });
    }

    const test = await Test.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found or already inactive",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.restoreTest = async (req, res) => {
  try {
    const id = req.params.id;
    const test = await Test.findOneAndUpdate(
      { _id: id, isActive: false },
      { isActive: true },
      { new: true },
    );
    if (!test) {
      return res.status(404).json({
        success: true,
        message: "Test not found or already active",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Test restored successfully",
      data: test,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
