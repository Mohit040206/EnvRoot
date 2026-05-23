const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  createTest,
  getAllTests,
  updateTest,
  deleteTest,
  restoreTest,
  getTestById,
  getAvailableTests,
} = require("../controllers/testController");

const router = express.Router();

/**
 * @swagger
 * /tests:
 *   post:
 *     summary: Create a new test
 *     tags: [Tests]
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
 *               - title
 *               - duration
 *               - questionIds
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [CODING, APTITUDE, LOGICAL, VERBAL]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *                 description: Duration in minutes
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               rules:
 *                 type: object
 *                 properties:
 *                   randomizeQuestions:
 *                     type: boolean
 *                   minQuestionToAttempt:
 *                     type: number
 *                   fullscreenRequired:
 *                     type: boolean
 *                   maxTabSwitch:
 *                     type: number
 *     responses:
 *       201:
 *         description: Test created successfully
 *       400:
 *         description: Validation error or duplicate title
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.post("/admin", authenticate, authorize(["ADMIN"]), createTest);

/**
 * @swagger
 * /tests:
 *   get:
 *     summary: Get all active tests
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tests fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.get("/admin", authenticate, authorize(["ADMIN"]), getAllTests);

/**
 * @swagger
 * /tests/available:
 *   get:
 *     summary: Get available tests for user with attempt status
 *     tags: [Tests - User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available tests fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/user/available",
  authenticate,
  authorize(["USER"]),
  getAvailableTests,
);

/**
 * @swagger
 * /tests/{id}:
 *   get:
 *     summary: Get test details by ID
 *     tags: [Tests]
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
 *       200:
 *         description: Test fetched successfully
 *       400:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authenticate, authorize(["ADMIN", "USER"]), getTestById);

/**
 * @swagger
 * /tests/{id}:
 *   put:
 *     summary: Update an existing test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Test ID
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *                 description: Duration in minutes
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               rules:
 *                 type: object
 *                 properties:
 *                   randomizeQuestions:
 *                     type: boolean
 *                   minQuestionToAttempt:
 *                     type: number
 *                   fullscreenRequired:
 *                     type: boolean
 *                   maxTabSwitch:
 *                     type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Test updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.put("/admin/:id", authenticate, authorize(["ADMIN"]), updateTest);

/**
 * @swagger
 * /tests/{id}:
 *   delete:
 *     summary: Soft delete a test
 *     tags: [Tests]
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
 *       200:
 *         description: Test deleted successfully
 *       404:
 *         description: Test not found or already inactive
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Internal server error
 */
router.delete("/admin/:id", authenticate, authorize(["ADMIN"]), deleteTest);

/**
 * @swagger
 * /tests/{id}/restore:
 *   patch:
 *     summary: Restore a deleted test
 *     tags: [Tests]
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
 *       200:
 *         description: Test restored successfully
 *       404:
 *         description: Test not found or already active
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
  restoreTest,
);

module.exports = router;
