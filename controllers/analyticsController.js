const Test = require("../model/Test");
const User = require("../model/User");
const TestAttempt = require("../model/TestAttempt");

exports.adminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "USER" });
    const totalTests = await Test.countDocuments({ isActive: true });
    const attempts = await TestAttempt.find();
    const submitted = attempts.filter((a) => a.status === "SUBMITTED");

    const avgScore =
      submitted.length === 0
        ? 0
        : Math.round(
            submitted.reduce((a, b) => a + b.score, 0) / submitted.length,
          );
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTests,
        totalAttempts: attempts.length,
        submittedAttempts: submitted.length,
        averageScore: avgScore,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.adminTestAnalytics = async (req, res) => {
  try {
    const tests = await Test.find({ isActive: true });

    const data = [];

    for (const test of tests) {
      const attempts = await TestAttempt.find({
        testId: test._id,
        status: "SUBMITTED",
      });

      const totalAttempts = attempts.length;

      const avgScore =
        totalAttempts === 0
          ? 0
          : Math.round(
              attempts.reduce((a, b) => a + b.score, 0) / totalAttempts,
            );

      const passedCount = attempts.filter((a) => a.score >= 60).length;

      data.push({
        testId: test._id,
        title: test.title,
        totalAttempts,
        averageScore: avgScore,
        passRate:
          totalAttempts === 0
            ? "0%"
            : `${Math.round((passedCount / totalAttempts) * 100)}%`,
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.adminUserAnalytics = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" });

    const data = [];

    for (const user of users) {
      const attempts = await TestAttempt.find({
        userId: user._id,
        status: "SUBMITTED",
      });

      const totalAttempts = attempts.length;

      const avgScore =
        totalAttempts === 0
          ? 0
          : Math.round(
              attempts.reduce((a, b) => a + b.score, 0) / totalAttempts,
            );

      data.push({
        userId: user._id,
        name: user.userName,
        email: user.email,
        totalAttempts,
        averageScore: avgScore,
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
