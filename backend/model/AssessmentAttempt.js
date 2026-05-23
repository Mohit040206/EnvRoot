const assessmentAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },

    sections: [
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

        questions: [
          {
            questionId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Questions",
              required: true,
            },

            // MCQ only
            selectedOption: String,
            isCorrect: Boolean,

            // CODING only (future-safe)
            code: String,
            language: String,
            passedTCs: Number,
            totalTCs: Number,
          },
        ],
      },
    ],
    score: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ONGOING", "SUBMITTED", "EXPIRED"],
      default: "ONGOING",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssessmentAttempt", assessmentAttemptSchema);
