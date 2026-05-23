const Questions = require("../model/Questions");
const Assessment = require("../model/Assessment");
const redisClient = require("../config/redis");
const { evaluateMCQ } = require("../services/mcqEvaluator");
const { evaluateCoding } = require("../services/codingEvaluator");

/* ==============================
   START ASSESSMENT
================================ */
exports.startAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;

    const assessment = await Assessment.findOne({
      _id: assessmentId,
      isActive: true,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    const redisKey = `assessment:${assessmentId}:${userId}`;

    // prevent restart
    const existingSession = await redisClient.get(redisKey);
    if (existingSession) {
      const session = JSON.parse(existingSession);
      return res.status(200).json({
        success: true,
        message: "Assessment already started",
        data: {
          assessmentId,
          expiresAt: session.expiresAt,
          currentSection:
            session.sections[session.currentSectionIndex].category,
        },
      });
    }

    const sections = [];

    for (const section of assessment.sections) {
      const questions = await Questions.aggregate([
        {
          $match: {
            category: section.category,
            questionType: section.questionType,
            isActive: true,
          },
        },
        { $sample: { size: section.totalQuestions } },
      ]);

      if (questions.length < section.totalQuestions) {
        return res.status(400).json({
          success: false,
          message: `Not enough questions for ${section.category}`,
        });
      }

      sections.push({
        category: section.category,
        questionType: section.questionType,
        duration: section.duration,
        questions: questions.map((q) => ({
          questionId: q._id,
          selectedOption: null,
          isCorrect: null,
          code: null,
          passedTCs: 0,
          totalTCs: q.testCases?.length || 0,
        })),
        sectionScore: 0,
      });
    }

    const now = Date.now();
    const expiresAt = new Date(now + assessment.totalDuration * 60 * 1000);

    const redisPayload = {
      assessmentId,
      userId,
      status: "ONGOING",
      startedAt: new Date(now),
      expiresAt,
      currentSectionIndex: 0,
      sections,
      totalScore: 0,
    };

    await redisClient.set(redisKey, JSON.stringify(redisPayload), {
      EX: assessment.totalDuration * 60,
    });

    return res.status(200).json({
      success: true,
      message: "Assessment Started",
      data: {
        assessmentId,
        expiresAt,
        currentSection: sections[0].category,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ==============================
   GET CURRENT SECTION QUESTIONS
================================ */
exports.getCurrentIndexQuestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;

    const redisKey = `assessment:${assessmentId}:${userId}`;
    const sessionRaw = await redisClient.get(redisKey);

    if (!sessionRaw) {
      return res.status(404).json({
        success: false,
        message: "Assessment session not found or expired",
      });
    }

    const session = JSON.parse(sessionRaw);

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(403).json({
        success: false,
        message: "Assessment time expired",
      });
    }

    if (session.status !== "ONGOING") {
      return res.status(400).json({
        success: false,
        message: "Assessment already submitted",
      });
    }

    const section = session.sections[session.currentSectionIndex];
    const questionIds = section.questions.map((q) => q.questionId);

    const questions = await Questions.find({
      _id: { $in: questionIds },
      isActive: true,
    }).select("description options category questionType");

    return res.status(200).json({
      success: true,
      data: {
        category: section.category,
        questionType: section.questionType,
        duration: section.duration,
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

/* ==============================
   SUBMIT MCQ ANSWER
================================ */
exports.submitMCQAnswers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;
    const { questionId, selectedOption } = req.body;

    if (!questionId || !selectedOption) {
      return res.status(400).json({
        success: false,
        message: "questionId and selectedOption are required",
      });
    }

    const redisKey = `assessment:${assessmentId}:${userId}`;
    const sessionRaw = await redisClient.get(redisKey);

    if (!sessionRaw) {
      return res.status(404).json({
        success: false,
        message: "Assessment session not found or expired",
      });
    }

    const session = JSON.parse(sessionRaw);

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(403).json({
        success: false,
        message: "Assessment time expired",
      });
    }

    if (session.status !== "ONGOING") {
      return res.status(400).json({
        success: false,
        message: "Assessment already submitted",
      });
    }

    const question =
      await Questions.findById(questionId).select("correctAnswer");
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const { isCorrect } = evaluateMCQ({
      selectedOption,
      correctAnswer: question.correctAnswer,
    });

    let updated = false;

    for (const section of session.sections) {
      for (const q of section.questions) {
        if (q.questionId.toString() === questionId) {
          q.selectedOption = selectedOption;
          q.isCorrect = isCorrect;
          updated = true;
        }
      }

      const correct = section.questions.filter(
        (x) => x.isCorrect === true,
      ).length;

      const attempted = section.questions.filter(
        (x) => x.isCorrect !== null,
      ).length;

      section.sectionScore =
        attempted === 0 ? 0 : Math.round((correct / attempted) * 100);
    }

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to this assessment",
      });
    }

    session.totalScore = Math.round(
      session.sections.reduce((sum, s) => sum + s.sectionScore, 0) /
        session.sections.length,
    );

    const ttl = await redisClient.ttl(redisKey);
    await redisClient.set(redisKey, JSON.stringify(session), {
      EX: ttl > 0 ? ttl : 60,
    });

    return res.status(200).json({
      success: true,
      message: "MCQ answer saved",
      data: {
        isCorrect,
        sectionScore:
          session.sections[session.currentSectionIndex].sectionScore,
        totalScore: session.totalScore,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.submitCodingAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assessmentId } = req.params;
    const { questionId, code, language } = req.body;

    if (!questionId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "questionId, code and language are required",
      });
    }

    const redisKey = `assessment:${assessmentId}:${userId}`;
    const sessionRaw = await redisClient.get(redisKey);

    if (!sessionRaw) {
      return res.status(404).json({
        success: false,
        message: "Assessment session not found or expired",
      });
    }

    const session = JSON.parse(sessionRaw);

    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(403).json({
        success: false,
        message: "Assessment time expired",
      });
    }

    if (session.status !== "ONGOING") {
      return res.status(400).json({
        success: false,
        message: "Assessment already submitted",
      });
    }

    const question = await Questions.findById(questionId).select("testCases");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const { passedTCs, totalTCs } = await evaluateCoding({
      code,
      language,
      testCases: question.testCases,
    });

    let updated = false;

    for (const section of session.sections) {
      if (section.questionType !== "CODING") continue;

      for (const q of section.questions) {
        if (q.questionId.toString() === questionId) {
          q.code = code;
          q.language = language;
          q.passedTCs = passedTCs;
          q.totalTCs = totalTCs;
          updated = true;
        }
      }

      const scores = section.questions.map((q) =>
        q.totalTCs === 0 ? 0 : (q.passedTCs / q.totalTCs) * 100,
      );

      section.sectionScore =
        scores.length === 0
          ? 0
          : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to this assessment",
      });
    }

    session.totalScore = Math.round(
      session.sections.reduce((sum, s) => sum + s.sectionScore, 0) /
        session.sections.length,
    );

    const ttl = await redisClient.ttl(redisKey);
    await redisClient.set(redisKey, JSON.stringify(session), {
      EX: ttl > 0 ? ttl : 60,
    });

    return res.status(200).json({
      success: true,
      message: "Code submitted successfully",
      data: {
        passedTCs,
        totalTCs,
        sectionScore:
          session.sections[session.currentSectionIndex].sectionScore,
        totalScore: session.totalScore,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
