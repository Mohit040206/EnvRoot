const express = require("express");
const {
  createQuestions,
  getAllQuestions,
  getQuestionsById,
  updateQuestions,
  deleteQuestions,
  restoreQuestions,
  getAllDeletedQuestions,
} = require("../controllers/questionsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new coding question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - questionType
 *               - description
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [CODING, APTITUDE, LOGICAL, VERBAL]
 *                 example: CODING
 *               questionType:
 *                 type: string
 *                 enum: [CODING, MCQ]
 *                 example: CODING
 *               title:
 *                 type: string
 *                 example: Two Sum
 *               description:
 *                 type: string
 *                 example: Find two numbers that add up to a target
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *                 example: EASY
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               constraints:
 *                 type: array
 *                 items:
 *                   type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               testCases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: array
 *                     output:
 *                       type: string
 *                     explanation:
 *                       type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Question with this title already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.post("/admin", authenticate, authorize(["ADMIN"]), createQuestions);

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all active questions with filters
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or tags
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty level
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tag
 *     responses:
 *       200:
 *         description: Questions fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticate, authorize(["USER", "ADMIN"]), getAllQuestions);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get question details by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question fetched successfully
 *       400:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  authorize(["USER", "ADMIN"]),
  getQuestionsById,
);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Update an existing question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [CODING, APTITUDE, LOGICAL, VERBAL]
 *                 example: CODING
 *               questionType:
 *                 type: string
 *                 enum: [CODING, MCQ]
 *                 example: CODING
 *               title:
 *                 type: string
 *                 example: Two Sum
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD]
 *                 example: EASY
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               constraints:
 *                 type: array
 *                 items:
 *                   type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: string
 *               testCases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: array
 *                     output:
 *                       type: string
 *                     explanation:
 *                       type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.put("/admin/:id", authenticate, authorize(["ADMIN"]), updateQuestions);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Soft delete a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/admin/:id",
  authenticate,
  authorize(["ADMIN"]),
  deleteQuestions,
);

/**
 * @swagger
 * /questions/{id}/restore:
 *   patch:
 *     summary: Restore a deleted question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question restored successfully
 *       404:
 *         description: Question not found or already active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/admin/:id/restore",
  authenticate,
  authorize(["ADMIN"]),
  restoreQuestions,
);

/**
 * @swagger
 * /questions/admin/deleted:
 *   get:
 *     summary: Get all deleted questions
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted questions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/admin/deleted",authenticate,authorize(["ADMIN"]),getAllDeletedQuestions)
module.exports = router;
