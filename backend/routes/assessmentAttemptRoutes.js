const express = require("express");

const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  startAssessment,
  getCurrentIndexQuestions,
} = require("../controllers/assessmentAttemptController");
const router = express.Router();

/**
 * @swagger
 * /assessmentattempt/{assessmentId}/start:
 *   post:
 *     summary: Start an assessment attempt
 *     tags: [Assessment Attempt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Assessment started successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:assessmentId/start",
  authenticate,
  authorize(["USER"]),
  startAssessment,
);

/**
 * @swagger
 * /assessmentattempt/{assessmentId}/questions/current-index:
 *   get:
 *     summary: Get current index questions for an assessment
 *     tags: [Assessment Attempt]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Current index questions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:assessmentId/questions/current-index",
  authenticate,
  authorize(["USER"]),
  getCurrentIndexQuestions,
);
module.exports = router;
