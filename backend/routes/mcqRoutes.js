const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { testEvaluateMCQ } = require("../controllers/mcqController");

const router = express.Router();

/**
 * @swagger
 * /checkmcq:
 *   post:
 *     summary: Evaluate MCQ test
 *     tags: [MCQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - selectedOption
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedOption:
 *                 type: string
 *     responses:
 *       200:
 *         description: MCQ evaluated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post("/", authenticate, authorize(["USER", "ADMIN"]), testEvaluateMCQ);

module.exports = router;
