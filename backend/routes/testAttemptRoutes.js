const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  getTestQuestions,
  startTest,
  submitTest,
  submitAnswers,
} = require("../controllers/testAttemptController");
const { runCode } = require("../controllers/sandboxController");
const router = express.Router();

/**
 * @swagger
 * /attempt/{id}/start:
 *   post:
 *     summary: Start a test attempt
 *     tags: [Test Attempt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test ID
 *     responses:
 *       201:
 *         description: Test started successfully
 *       200:
 *         description: Existing ongoing attempt returned
 *       403:
 *         description: Test already completed
 *       404:
 *         description: Test not found or inactive
 *       500:
 *         description: Internal server error
 */
router.post("/user/:id/start", authenticate, authorize(["USER"]), startTest);

/**
 * @swagger
 * /attempt/{attemptId}/questions:
 *   get:
 *     summary: Get questions for an ongoing test attempt
 *     tags: [Test Attempt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attempt ID
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *       403:
 *         description: Test expired or already submitted
 *       404:
 *         description: Test attempt not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:attemptId/questions",
  authenticate,
  authorize(["USER"]),
  getTestQuestions,
);

/**
 * @swagger
 * /attempt/{attemptId}/question/{questionId}/save:
 *   post:
 *     summary: Save answer for a question during test
 *     tags: [Test Attempt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attempt ID
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - language
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *                 enum: [javascript]
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *       400:
 *         description: Invalid attempt or missing fields
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/user/:attemptId/question/:questionId/save",
  authenticate,
  authorize(["USER"]),
  submitAnswers,
);

/**
 * @swagger
 * /attempt/{attemptId}/submit:
 *   post:
 *     summary: Submit test and calculate final result
 *     tags: [Test Attempt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Attempt ID
 *     responses:
 *       200:
 *         description: Test submitted successfully
 *       400:
 *         description: Test already submitted or invalid
 *       500:
 *         description: Internal server error
 */
router.post(
  "/user/:attemptId/submit",
  authenticate,
  authorize(["USER"]),
  submitTest,
);
module.exports = router;
