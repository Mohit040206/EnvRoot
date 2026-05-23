const Questions = require("../model/Questions");

/* ================================
   CREATE QUESTION
================================ */
exports.createQuestions = async (req, res) => {
  try {
    let {
      category,
      questionType,
      title,
      description,
      difficulty,
      tags,
      constraints,
      testCases,
      options,
      correctAnswer,
    } = req.body;

    // Required fields
    if (!category || !questionType || !description || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const allowedCategories = ["CODING", "APTITUDE", "LOGICAL", "VERBAL"];
    const allowedQuestionTypes = ["CODING", "MCQ"];

    if (!allowedCategories.includes(category)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });
    }

    if (!allowedQuestionTypes.includes(questionType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid questionType" });
    }

    if (questionType === "CODING" && category !== "CODING") {
      return res.status(400).json({
        success: false,
        message: "Coding questions must have category CODING",
      });
    }

    if (questionType === "MCQ" && category === "CODING") {
      return res.status(400).json({
        success: false,
        message: "MCQ questions cannot have CODING category",
      });
    }

    const q = await Questions.findOne({ description, isActive: true });
    if (q) {
      return res.status(400).json({
        success: false,
        message: "Description of the question must be different",
      });
    }

    const normalize = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    // MCQ validation
    if (questionType === "MCQ") {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "MCQ must have at least 2 options",
        });
      }

      if (!correctAnswer || !options.includes(correctAnswer)) {
        return res.status(400).json({
          success: false,
          message: "correctAnswer must be one of the options",
        });
      }

      testCases = [];
    }

    // CODING validation
    if (questionType === "CODING") {
      if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Coding questions must have test cases",
        });
      }
    }

    const normalizedTestCases = Array.isArray(testCases)
      ? testCases.map((tc) => ({
          ...tc,
          input: normalize(tc.input),
          output: normalize(tc.output),
        }))
      : [];

    // Duplicate title protection
    // const exists = await Questions.findOne({ title, isActive: true });
    // if (exists) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Question with this title already exists",
    //   });
    // }

    const question = await Questions.create({
      category,
      questionType,
      title,
      description,
      difficulty,
      tags,
      constraints,
      options,
      correctAnswer,
      testCases: normalizedTestCases,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================================
   GET ALL QUESTIONS
================================ */
exports.getAllQuestions = async (req, res) => {
  try {
    const { search, difficulty, tags, category, questionType } = req.query;

    const query = { isActive: true };

    if (category) query.category = category.toUpperCase();
    if (questionType) query.questionType = questionType.toUpperCase();
    if (difficulty) query.difficulty = difficulty.toUpperCase();
    if (tags) query.tags = tags;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const questions = await Questions.find(query)
      .select("title category questionType difficulty tags createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { count: questions.length, questions },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================================
   GET QUESTION BY ID
================================ */
exports.getQuestionsById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Questions.findOne({ _id: id, isActive: true });
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================================
   UPDATE QUESTION
================================ */
exports.updateQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Disallow changing category/questionType
    delete updateData.category;
    delete updateData.questionType;

    if (updateData.testCases) {
      updateData.testCases = updateData.testCases.map((tc) => ({
        ...tc,
        input: tc.input,
        output: tc.output,
      }));
    }

    const updated = await Questions.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================================
   GET ALL Deleted QUESTIONS
================================ */
exports.getAllDeletedQuestions = async (req, res) => {
  try {
    const { search, difficulty, tags, category, questionType } = req.query;

    const query = { isActive: false };

    if (category) query.category = category.toUpperCase();
    if (questionType) query.questionType = questionType.toUpperCase();
    if (difficulty) query.difficulty = difficulty.toUpperCase();
    if (tags) query.tags = tags;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const questions = await Questions.find(query)
      .select("title category questionType difficulty tags createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { count: questions.length, questions },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* ================================
   DELETE / RESTORE
================================ */
exports.deleteQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Questions.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Question deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.restoreQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await Questions.findOneAndUpdate(
      { _id: id, isActive: false },
      { isActive: true },
      { new: true },
    );

    if (!restored) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      message: "Question restored successfully",
      data: restored,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
