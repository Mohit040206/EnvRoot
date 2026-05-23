const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    explanation: String,
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["CODING", "APTITUDE", "LOGICAL", "VERBAL"],
      required: true,
    },

    questionType: {
      type: String,
      enum: ["CODING", "MCQ"],
      required: true,
    },

    title: {
      type: String,
      trim: true,
      required: false,
      unique: false,
    },

    description: {
      type: String,
      required: true,
      unique: true,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      // required: true,
    },

    tags: [String],
    constraints: [String],

    // MCQ ONLY
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          if (this.questionType === "MCQ" && this.options.length === 4) {
            return Array.isArray(v) && v.length >= 2;
          }
          return v.length === 0;
        },
        message: "MCQ questions must have 4 options",
      },
    },

    correctAnswer: {
      type: String,
      validate: {
        validator: function (v) {
          if (this.questionType === "MCQ") {
            return this.options.includes(v);
          }
          return v === undefined;
        },
        message: "correctAnswer must be one of the options",
      },
    },

    // CODING ONLY
    testCases: {
      type: [testCaseSchema],
      default: [],
      validate: {
        validator: function (v) {
          if (this.questionType === "CODING") {
            return Array.isArray(v) && v.length > 0;
          }
          return v.length === 0;
        },
        message: "Only coding questions can have test cases",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes for pool + search
questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ title: "text", tags: "text" });

module.exports = mongoose.model("Questions", questionSchema);
