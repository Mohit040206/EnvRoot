const mongoose = require("mongoose");

const answerSchema = mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions",
      required: true,
    },
    code: {
      type: String,
    },
    language: {
      type: String,
    },
    passedTCs: {
      type: Number,
      default: 0,
    },
    totalTCs: {
      type: Number,
      default: 0,
    },

    selectedOptions: String,
    isCorrect: Boolean,

    percentage: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ONGOING", "SUBMITTED", "EXPIRED"],
      default: "ONGOING",
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TestAttempt", testAttemptSchema);
