const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["APTITUDE", "LOGICAL", "VERBAL", "CODING"],
      required: true,
    },
    questionType: {
      type: String,
      enum: ["MCQ", "CODING"],
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: function () {
        return this.questionType === "CODING";
      },
    },

    description: String,

    assessmentType: {
      type: String,
      enum: ["CERTIFICATION", "WEEKLY_RANKING", "HIRING"],
      // required: true,
    },

    testIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
      },
    ],

    sections: {
      type: [sectionSchema],
      default: [],
    },

    totalDuration: {
      type: Number,
      required: true,
    },

    pointsConfig: {
      enabled: {
        type: Boolean,
        default: false,
      },
    },

    instructions: String,

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assessment", assessmentSchema);
