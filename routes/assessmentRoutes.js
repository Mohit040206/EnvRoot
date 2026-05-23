const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  createAssessment,
  getAllAssessments,
  getAssessmentById,
  updateAssessmentById,
  deleteAssessmentById,
  restoreAssessmentById,
  checkQuestionPoolHelth,
} = require("../controllers/assessmentController");

const router = express.Router();
/**
 * @swagger
 * /assessment/admin:
 *   post:
 *     summary: Create a new assessment
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalDuration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assessmentType:
 *                 type: string
 *                 enum: [CERTIFICATION, WEEKLY_RANKING, HIRING]
 *               testIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                       enum: [APTITUDE, LOGICAL, VERBAL, CODING]
 *                     questionType:
 *                       type: string
 *                       enum: [MCQ, CODING]
 *                     totalQuestions:
 *                       type: number
 *                     duration:
 *                       type: number
 *               totalDuration:
 *                 type: number
 *               pointsConfig:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *               instructions:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Assessment created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post("/admin", authenticate, authorize(["ADMIN"]), createAssessment);

/**
 * @swagger
 * /assessment:
 *   get:
 *     summary: Get all assessments
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assessments fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, authorize(["ADMIN", "USER"]), getAllAssessments);

/**
 * @swagger
 * /assessment/{id}:
 *   get:
 *     summary: Get assessment by ID
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "USER"]),
  getAssessmentById,
);

/**
 * @swagger
 * /assessment/admin/{id}:
 *   put:
 *     summary: Update an assessment by ID
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assessmentType:
 *                 type: string
 *                 enum: [CERTIFICATION, WEEKLY_RANKING, HIRING]
 *               testIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               sections:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                       enum: [APTITUDE, LOGICAL, VERBAL, CODING]
 *                     questionType:
 *                       type: string
 *                       enum: [MCQ, CODING]
 *                     totalQuestions:
 *                       type: number
 *                     duration:
 *                       type: number
 *               totalDuration:
 *                 type: number
 *               pointsConfig:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *               instructions:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/admin/:id",
  authenticate,
  authorize(["ADMIN"]),
  updateAssessmentById,
);

/**
 * @swagger
 * /assessment/admin/{id}:
 *   delete:
 *     summary: Delete an assessment by ID
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/admin/:id",
  authenticate,
  authorize(["ADMIN"]),
  deleteAssessmentById,
);

/**
 * @swagger
 * /assessment/admin/{id}/restore:
 *   patch:
 *     summary: Restore a deleted assessment by ID
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessment restored successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/admin/:id/restore",
  authenticate,
  authorize(["ADMIN"]),
  restoreAssessmentById,
);

/**
 * @swagger
 * /assessment/admin/{id}/question-health:
 *   get:
 *     summary: Check question pool health for an assessment
 *     tags: [Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question pool health checked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/:id/question-health",
  authenticate,
  authorize(["ADMIN"]),
  checkQuestionPoolHelth,
);

module.exports = router;
