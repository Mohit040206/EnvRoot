const mongoose = require("mongoose");
const Assessment = require("../model/Assessment");
const Test = require("../model/Test");
const TestAttempt = require("../model/TestAttempt");
const Questions = require("../model/Questions");

/* =====================================================
   CREATE ASSESSMENT
===================================================== */
exports.createAssessment = async (req, res) => {
  try {
    const {
      title,
      description,
      assessmentType,
      testIds,
      sections,
      pointsConfig,
      instructions,
    } = req.body;

    // -------- BASIC VALIDATION --------
    if (!title || !assessmentType) {
      return res.status(400).json({
        success: false,
        message: "title and assessmentType are required",
      });
    }

    // -------- SECTIONS --------
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one section is required",
      });
    }

    const categories = sections.map((s) => s.category);
    if (new Set(categories).size !== categories.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate section categories are not allowed",
      });
    }

    for (const section of sections) {
      if (
        !section.category ||
        !section.questionType ||
        !Number.isInteger(section.totalQuestions) ||
        section.totalQuestions <= 0 ||
        !Number.isInteger(section.duration) ||
        section.duration <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid section configuration",
        });
      }
    }

    // -------- DUPLICATE TITLE --------
    const existing = await Assessment.findOne({ title, isActive: true });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Assessment with this title already exists",
      });
    }

    // -------- TOTAL DURATION --------
    let totalDuration = 0;

    if (Array.isArray(testIds) && testIds.length > 0) {
      const tests = await Test.find({
        _id: { $in: testIds },
        isActive: true,
      });

      if (tests.length !== testIds.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive testIds",
        });
      }

      totalDuration = tests.reduce((sum, t) => sum + t.duration, 0);
    } else {
      // POOL BASED
      totalDuration = sections.reduce((sum, s) => sum + s.duration, 0);
    }

    const assessment = await Assessment.create({
      title,
      description,
      assessmentType,
      testIds: testIds || [],
      sections,
      totalDuration,
      pointsConfig,
      instructions,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Assessment created successfully",
      data: assessment,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =====================================================
   GET ALL
===================================================== */
exports.getAllAssessments = async (req, res) => {
  try {
    const { assessmentType, isActive, search } = req.query;
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === "true";
    if (assessmentType) query.assessmentType = assessmentType.toUpperCase();
    if (search) query.title = { $regex: search, $options: "i" };

    const result = await Assessment.find(query)
      .select("title assessmentType sections totalDuration isActive createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { count: result.length, result },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   GET BY ID
===================================================== */
exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Assessment Id",
      });
    }

    const assessment = await Assessment.findById(id).populate({
      path: "testIds",
      select: "title duration",
    });

    if (!assessment || !assessment.isActive) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.status(200).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   UPDATE
===================================================== */
exports.updateAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Assessment Id",
      });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment || !assessment.isActive) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    const attemptExists = await TestAttempt.exists({ assessmentId: id });
    if (attemptExists) {
      return res.status(409).json({
        success: false,
        message: "Assessment cannot be updated after attempts start",
      });
    }

    const updated = await Assessment.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Assessment updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   DELETE / RESTORE
===================================================== */
exports.deleteAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const attemptExists = await TestAttempt.exists({ assessmentId: id });
    if (attemptExists) {
      return res.status(409).json({
        success: false,
        message: "Assessment cannot be deleted after attempts start",
      });
    }

    const deleted = await Assessment.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.restoreAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const restored = await Assessment.findOneAndUpdate(
      { _id: id, isActive: false },
      { isActive: true },
      { new: true },
    );

    if (!restored) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found or already active",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assessment restored successfully",
      data: restored,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =====================================================
   QUESTION POOL HEALTH
===================================================== */
exports.checkQuestionPoolHelth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment id",
      });
    }

    const assessment = await Assessment.findOne({ _id: id, isActive: true });
    if (!assessment || !assessment.sections?.length) {
      return res.status(400).json({
        success: false,
        message: "Assessment has no valid sections",
      });
    }

    let overallStatus = "HEALTHY";
    const sections = [];

    for (const section of assessment.sections) {
      const available = await Questions.countDocuments({
        category: section.category,
        questionType: section.questionType,
        isActive: true,
      });

      const status =
        available >= section.totalQuestions ? "OK" : "INSUFFICIENT";

      if (status === "INSUFFICIENT") overallStatus = "UNHEALTHY";

      sections.push({
        category: section.category,
        questionType: section.questionType,
        required: section.totalQuestions,
        available,
        status,
      });
    }

    res.status(200).json({
      success: true,
      data: { assessmentId: assessment._id, overallStatus, sections },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
